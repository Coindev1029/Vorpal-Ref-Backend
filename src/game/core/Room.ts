import { PlayerRow, UserEvent } from '../types/interfaces';
import { GameIoServer } from './Server';
import { PlayerState } from '../types';
import { WriteLog } from '../../database/log';
import * as config from '../config';
import Star from '../gameplay/Star';
import ObjectListManager from './ListManager';
import Planet from '../gameplay/Planet';
import { objectDisplayInfo, objectMapInfo } from '../types/gameplay';
import GameObject from '../gameplay/GameObject';
import { actionList, classes, objectInfo } from '../types/msg';
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
  private store: Store;

  constructor(_server: GameIoServer, _players: PlayerRow[]) {
    this.server = _server;
    this.players = _players;
    const race1: race = raceArr[Math.floor(Math.random() * raceArr.length)];
    const race2: race = raceArr[Math.floor(Math.random() * raceArr.length)];
    this.store = new Store(
      _players[0].publicKey,
      _players[1].publicKey,
      race1,
      race2,
    );
    this.manager = new ObjectListManager();

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
        } catch (e) {}
        // WriteLog(player.publicKey, `Received in game : ${String(message)}`)

        switch (msg.action) {
          case actionList.buyitem:
            if (msg.data) {
              const result = this.store.BuyItem(
                player.publicKey,
                msg.data.name,
              );
              const responce = {
                action: actionList.buyreport,
                result: result,
              };
              player.ws.send(JSON.stringify(responce));
            }
            break;
          case actionList.exitgame:
            this.Finish(index === 0 ? 1 : 0);
            break;
        }
      });
    });
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

  public SendLog(...params: any[]) {
    this.ReSendMessage(JSON.stringify({
      action: actionList.log,
      ...params
    }))
  }

  public Start() {
   // this.SendLog('start');
   
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
      const playerPosition =
        player.publicKey === this.players[0].publicKey ? 'top' : 'bottom';
      player.ws.send(
        JSON.stringify({
          action: actionList.gamestart,
          playerPosition: playerPosition,
          orbitRadius: defCoords.orbRadius,
          objectMovesPerSec: 1000 / config.FrameInterval,
          gameField: gameField
        }),
      );
    });
    this.isActive = true;
    const list: objectDisplayInfo[] = [];
      const star1 = new Star(
        this,
        this.players[0].publicKey,
        config.defCoords.star1,
        config.defCoords.sprites.star.radius,
        this.manager
      );


    list.push({
      id: star1.getId(),
      owner: star1.owner,
      class: star1.class,
      position: star1.center,
      radius: star1.radius,
      energy: config.defStarHealth
    });

    const star2 = new Star(
      this,
      this.players[1].publicKey,
      config.defCoords.star2,
      config.defCoords.sprites.star.radius,
      this.manager
    );

    list.push({
      id: star2.getId(),
      owner: star2.owner,
      class: star2.class,
      position: star2.center,
      radius: star2.radius,
      energy: config.defStarHealth
    });

    const planet1 = new Planet(
      this,
      this.players[0].publicKey,
      { x: star1.center.x, y: star1.center.y - config.defCoords.orbRadius },
      config.defCoords.sprites.planet.radius,
      this.manager,
      false,
    );

    list.push({
      id: planet1.getId(),
      owner: planet1.owner,
      class: planet1.class,
      position: planet1.center,
      radius: planet1.radius,
      orbitRadius: defCoords.orbDiam / 2,
      orbitCenter: star1.center,
      startAngle: -90,
      year: shipCreationStartTime / 1000,
      rotationSpeed: config.planetRotationSpeed * 10,
      orbitSpeed: config.planetYearAngle * 10,
    });

    const planet2 = new Planet(
      this,
      this.players[1].publicKey,
      { x: star2.center.x, y: star2.center.y + config.defCoords.orbRadius },
      config.defCoords.sprites.planet.radius,
      this.manager,
      true,
    );

    list.push({
      id: planet2.getId(),
      owner: planet2.owner,
      class: planet2.class,
      position: planet2.center,
      radius: planet2.radius,
      orbitRadius: defCoords.orbDiam / 2,
      orbitCenter: star2.center,
      startAngle: 90,
      year: shipCreationStartTime / 1000,
      rotationSpeed: config.planetRotationSpeed * 10,
      orbitSpeed: config.planetYearAngle * 10,
    });

    this.manager.addObject(star1);
    this.manager.addObject(star2);
    this.manager.addObject(planet1);
    this.manager.addObject(planet2);

    const listMsg = {
      action: actionList.objectcreate,
      list: list,
    };
    this.ReSendMessage(JSON.stringify(listMsg));

    setTimeout(() => {
      star1.Activate();
      star2.Activate();   
      this.CreateShips();
    }, 1)

    this.shipCreationTimer = setInterval(() => {
      const shipList = this.manager.getObjectsByClassName(classes.ship);
      const shipList1 = shipList.filter((sh) => {
        return sh.owner === this.players[0].publicKey;
      });
      const shipList2 = shipList.filter((sh) => {
        return sh.owner === this.players[1].publicKey;
      });
      if (shipList1.length === 0 || shipList2.length === 0) {
        this.CreateShips();
      }
    }, shipCreationStartTime);
    this.battleShipCreationTimer = setInterval(() => {
      const shipList = this.manager.getObjectsByClassName(classes.battleship);
      const shipList1 = shipList.filter((sh) => {
        return sh.owner === this.players[0].publicKey;
      });
      const shipList2 = shipList.filter((sh) => {
        return sh.owner === this.players[1].publicKey;
      });
      if (shipList1.length === 0) {
        this.CreateBattleShip(this.players[0].publicKey);
      }

      if (shipList2.length === 0) {
        this.CreateBattleShip(this.players[1].publicKey);
      }
    }, shipCreationStartTime * 3); 
  }

  public ReSendMessage(message: string) {
    this.players.forEach((player) => {
      player.ws.send(message);
    });
  }

  private CreateShips() {
    const list: objectDisplayInfo[] = [];
    const ships: Ship[] = [];
    this.players.forEach((player, index) => {
      const mirror = index === 0 ? true : false;
      const center = gameField[0] / 2;
      const xPositions = [center - 80, center, center + 80];
      const yPosition = mirror ? 250 : 750;
      xPositions.forEach((pos, j) => {
        const ship = new Ship(
          this,
          player.publicKey,
          { x: pos, y: yPosition },
          defCoords.sprites.ship.radius,
          this.manager,
          mirror,
        );
        this.manager.addObject(ship);
        list.push({
          id: ship.getId(),
          owner: ship.owner,
          class: ship.class,
          position: ship.center,
          radius: ship.radius,
          mirror: mirror,
          hp: config.defShipHealth
        });
        ships.push(ship);
      });
    });
    const listMsg = {
      action: actionList.objectcreate,
      list: list,
    };
    this.players.forEach((player) => {
      player.ws.send(JSON.stringify(listMsg));
    });
    ships.forEach((sh, index) => {
      const posIndex = index < 3 ? index : index - 3;
      sh.Activate(posIndex);
    });
  }

  private CreateBattleShip(owner: string) {
    const list: objectMapInfo[] = [];

    const mirror = owner === this.players[0].publicKey ? true : false;
    const center = gameField[0] / 2;
    const xPosition = (gameField[0] / 4) * (mirror ? 3 : 1);
    const yPosition = mirror ? 200 : 800;
    const bShip = new BattlesShip(
      this,
      owner,
      { x: xPosition, y: yPosition },
      defCoords.sprites.ship.radius,
      this.manager,
    );
    list.push({
      id: bShip.getId(),
      owner: bShip.owner,
      class: bShip.class,
      position: bShip.center,
      radius: bShip.radius,
      mirror: mirror,
    });

    const listMsg: objectInfo = {
      action: actionList.objectcreate,
      list: list,
    };
    this.players.forEach((player) => {
      player.ws.send(JSON.stringify(listMsg));
    });
  }

  public StarDestroy(owner: string, id: string) {
    if (this.isActive) {
      let winner = 0;
      this.players.forEach((player, index) => {

        if (player.publicKey === owner) {
          winner = index === 0 ? 1 : 0;
        }
      });
      this.manager.removeObject(id);
      this.Finish(winner);
    }
  }

  public FrameUpdate() {
    this.SendLog('update');
    /* try {
      const ships = this.manager.getObjectsByClassName(classes.ship);
      const list : any[] = [];
      ships.forEach((ship) => {
        const rangeToStar = this.manager.calcRange(ship.center, ship.targetPosition);
        if (!ship.isAttacking) {
          if (rangeToStar <= config.shipSpeed) {
            ship.center = ship.targetPosition;
            ship.AttackStar();
          } else {
            const target = ship.FindTarget();
            if (target) {
              const range = this.manager.calcRange(ship.center, target.center);
              if (range <= config.shipRange) {
                ship.StartAttacking(target);
              } else {
                ship.MoveToPoint(target.center);
              }
            } else {
              ship.MoveToPoint(ship.targetPosition);
            }
          }
        }
        list.push({
          id: ship.id,
          owner: ship.owner,
          class: ship.class,
          position: ship.center
        })
      })
      this.ReSendMessage(JSON.stringify({
        action: actionList.objectupdate,
        class: classes.ship,
        list: list
      }))
    } catch (e) {
      this.SendLog('error', e.message);
    } */
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
          action: actionList.gameend,
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
