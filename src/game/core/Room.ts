import { PlayerRow, UserEvent } from '../types/interfaces';
import { GameIoServer } from './Server';
import { PlayerState } from '../types';
import { WriteLog } from '../../database/log';
import * as config from '../config';
import Star from '../gameplay/Star';
import ObjectListManager from './ListManager';
import Planet from '../gameplay/Planet';
import { objectMapInfo } from '../types/gameplay';
import GameObject from '../gameplay/GameObject';
import { actionList, objectInfo } from '../types/msg';
import { defCoords, gameField, shipCreationStartTime } from '../config';
import { Ship } from '../gameplay/Ship';
import { BattlesShip } from '../gameplay/BattleShip';
import Store from '../store/store';
import { race, raceArr } from '../types/user';

export class GameRoom {
  private players: PlayerRow[] = [];
  private server: GameIoServer;
  private roomItselfId: number = -1;
  private isActive: boolean = false;
  private manager: ObjectListManager<any>;
  private shipCreationTimer: NodeJS.Timer;
  private battleShipCreationTimer: NodeJS.Timer;
  private GameStartNotify = JSON.stringify({ action: 'gamestart' });
  private store: Store;

  constructor(_server: GameIoServer, _players: PlayerRow[]) {
    this.server = _server;
    this.players = _players;
    const race1: race = raceArr[Math.floor(Math.random() * raceArr.length)]
    const race2: race = raceArr[Math.floor(Math.random() * raceArr.length)]
    this.store = new Store(_players[0].publicKey, _players[1].publicKey, race1, race2)

    this.players.forEach((player, index) => {
       player.ws.on('message', (message) => {
        let msg: any;
        try {
          msg = JSON.parse(String(message));
        } catch (e) {
          return;
        }
        try {
          msg = JSON.parse(String(msg));
        } catch (e) {

        }
        // WriteLog(player.publicKey, `Received in game : ${String(message)}`)

        switch(msg.action) {
          case actionList.buyitem :
            if (msg.data) {
              const result = this.store.BuyItem(player.publicKey, msg.data.name)
              const responce = {
                action: 'buyreport',
                result: result
              }
              player.ws.send(JSON.stringify(responce))
            }
            break;
          case actionList.exitgame :
            this.Finish(index === 0 ? 1 : 0);
            break;
        }

       })
    })
  }

  public SetId(_id: number): boolean {
    if (this.roomItselfId === -1 && _id > -1) {
      this.roomItselfId = _id;
      return true;
    }
    return false;
  }

  public GetId(): number {
    return this.roomItselfId;
  }

  public isGameActive() {
    return this.isActive;
  }

  public EmitUserEvent(event: UserEvent) {
    this.players.forEach((player, index) => {
      if (player.publicKey === event.userPublicKey) {
        switch (event.type) {
          case 'close':
            this.Finish(index === 0 ? 1 : 0);
            break;
          default:
            return;
        }
      }
    });
    return;
  }

  public Start() {
    this.players.forEach((player) => {
      const state: PlayerState = {
        auth: true,
        inLookingFor: false,
        inGame: true,
        planetId: player.state.planetId,
        starId: player.state.starId,
        roomId: this.GetId(),
      };
      this.server.UpdatePlayerState(player.id, state);
      player.ws.send(this.GameStartNotify);
    });
    this.isActive = true;
    /* setTimeout(() => {
      this.Finish();
    }, config.roomTestTimeout); */
    const star1 = new Star(
      this,
      this.players[0].publicKey,
      config.defCoords.star1,
      config.defCoords.sprites.star,
    );
    const star2 = new Star(
      this,
      this.players[1].publicKey,
      config.defCoords.star2,
      config.defCoords.sprites.star,
    );
    const planet1 = new Planet(
      this,
      this.players[0].publicKey,
      config.defCoords.planet1,
      config.defCoords.sprites.planet,
      false,
      {
        orbitRadius: config.defCoords.orbDiam / 2
      }
    );
    const planet2 = new Planet(
      this,
      this.players[1].publicKey,
      config.defCoords.planet2,
      config.defCoords.sprites.planet,
      true,
      {
        orbitRadius: config.defCoords.orbDiam / 2
      }
    );
    this.manager = new ObjectListManager();
    this.manager.addObject(star1), this.manager.addObject(star2);
    this.manager.addObject(planet1);
    this.manager.addObject(planet2);

    const list: objectMapInfo[] = [];
    const objects = this.manager.getAllObjects();
    objects.forEach((ob: GameObject) => {
      list.push({
        id: ob.getId(),
        owner: ob.owner,
        class: ob.class,
        center: ob.center(),
        mirror: ob.owner === this.players[0].publicKey ? true : false,
      });
    });
    const listMsg: objectInfo = {
      action: actionList.objectList,
      list: list
    };
    this.players.forEach((player) => {
      player.ws.send(JSON.stringify(listMsg));
      player.ws.send(JSON.stringify({
        action: actionList.playerPosition,
        playerPosition: player.publicKey === this.players[0].publicKey ? 'top': 'bottom'
      }))
    });

    this.CreateShips();

    this.shipCreationTimer = setInterval(() => {
      const shipList = this.manager.getObjectsByClassName('ship');
      const shipList1 = shipList.filter((sh) => {
        return sh.owner === this.players[0].publicKey
      })
      const shipList2 = shipList.filter((sh) => {
        return sh.owner === this.players[1].publicKey
      })
      if (shipList1.length === 0 || shipList2.length === 0) {
        this.CreateShips();
      }
    }, shipCreationStartTime);
    this.battleShipCreationTimer = setInterval(() => {
      const shipList = this.manager.getObjectsByClassName('battleship');
      const shipList1 = shipList.filter((sh) => {
        return sh.owner === this.players[0].publicKey
      })
      const shipList2 = shipList.filter((sh) => {
        return sh.owner === this.players[1].publicKey
      })
      if (shipList1.length === 0) {
        this.CreateBattleShip (this.players[0].publicKey)
      }

      if (shipList2.length === 0) {
         this.CreateBattleShip (this.players[1].publicKey)
      }
    }, shipCreationStartTime * 3)

  }

  public ReSendMessage(message: string) {
    this.players.forEach((player) => {
      player.ws.send(message);
    });
  }

  private CreateShips() {
    const list: objectMapInfo[] = [];
    this.players.forEach((player, index) => {
      const mirror = index === 0 ? true : false;
      const center = gameField[0] / 2;
      const xPositions = [center - 100, center - 20, center + 80];
      const yPosition = mirror ? 250 : 750;
      xPositions.forEach((pos, j) => {
        const ship = new Ship(
          this,
          player.publicKey,
          { x: pos, y: yPosition },
          defCoords.sprites.ship,
          this.manager,
          mirror,
        );
        this.manager.addObject(ship);
        list.push({
          id: ship.getId(),
          owner: ship.owner,
          class: ship.class,
          center: ship.center(),
          mirror: mirror,
        });
      });
    });
    /* const listMsg: objectInfo = {
      action: actionList.objectcreate,
      list: list
    };
    this.players.forEach((player) => {
      player.ws.send(JSON.stringify(listMsg));
    }); */
  }

  private CreateBattleShip (owner: string) {
    const list: objectMapInfo[] = [];

      const mirror = owner === this.players[0].publicKey ? true : false;
      const center = gameField[0] / 2;
      const xPosition = (gameField[0] / 4 ) * (mirror ? 3 : 1);
      const yPosition = mirror ? 200 : 800;
      const bShip = new BattlesShip(
        this,
        owner,
        { x: xPosition, y: yPosition },
        defCoords.sprites.ship,
        this.manager
      );
      list.push({
        id: bShip.getId(),
        owner: bShip.owner,
        class: bShip.class,
        center: bShip.center(),
        mirror: mirror,
      });

    /* const listMsg: objectInfo = {
      action: actionList.objectcreate,
      list: list
    };
    this.players.forEach((player) => {
      player.ws.send(JSON.stringify(listMsg));
    }); */
  }

  public StarDestroy(owner: string, id: string) {
    if (this.isActive) {
      let winner = 0;
      this.players.forEach((player, index) => {
       /* player.ws.send(JSON.stringify({
         wallet: owner,
         msg: 'Star destroyed'
       })) */
          if(player.publicKey === owner) {
            winner = index === 0 ? 1 : 0;
          }
      });
      this.manager.removeObject(id);
      this.Finish(winner);
    }
  }

  private Finish(winner: number | null = null) {
    this.isActive = false;
    clearInterval(this.shipCreationTimer);
    clearInterval(this.battleShipCreationTimer);
    if (winner === null) winner = Math.ceil(Math.random() * 2) - 1; // REPLACE!!!
    WriteLog(
      `${this.players[0].publicKey} VS ${this.players[1].publicKey}`,
      `Game finished`,
    );
    this.players.forEach((player, index) => {
      const state: PlayerState = {
        auth: true,
        inLookingFor: false,
        inGame: false,
        planetId: player.state.planetId,
        starId: player.state.starId,
        roomId: -1,
      };
      this.server.UpdatePlayerState(player.id, state);
      player.ws.send(
        JSON.stringify({
          action: 'gameend',
          win: winner === index ? true : false,
        }),
      );
    });
    const dt = new Date();
    const objects = this.manager.getAllObjects();
    objects.forEach((obj) => {
      try {
        obj.destroy();
      } catch (e) {}
      try {
        this.manager.removeObject(obj.id);
      } catch (e) {}
    });

    SaveGameResult({
      playerOne: this.players[0].publicKey,
      playerTwo: this.players[1].publicKey,
      winner: winner === 0 ? 1 : 2,
      planet_id_one: this.players[0].state.planetId,
      planet_id_two: this.players[1].state.planetId,
      star_id_one: this.players[0].state.starId,
      star_id_two: this.players[1].state.starId,
      date: dt.getTime(),
    });
  }
}
