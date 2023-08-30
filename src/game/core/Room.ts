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

export class GameRoom {
  private players: PlayerRow[] = [];
  private server: GameIoServer;
  private roomItselfId: number = -1;
  private isActive: boolean = false;
  private manager: ObjectListManager<any>;
  private shipCreationTimer: NodeJS.Timer;
  private GameStartNotify = JSON.stringify({ action: 'gamestart' });

  constructor(_server: GameIoServer, _players: PlayerRow[]) {
    this.server = _server;
    this.players = _players;
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
    );
    const planet2 = new Planet(
      this,
      this.players[1].publicKey,
      config.defCoords.planet2,
      config.defCoords.sprites.planet,
      true,
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
      list: list,
    };
    this.players.forEach((player) => {
      player.ws.send(JSON.stringify(listMsg));
    });

    this.shipCreationTimer = setInterval(() => {
      const shipList = this.manager.getObjectsByClassName('ship');
      if (shipList.length === 0) {
        this.CreateShips();
      }
    }, shipCreationStartTime);
  }

  public ReSendMessage(message: string) {
    this.players.forEach((player) => {
      player.ws.send(JSON.stringify(message));
    });
  }

  private CreateShips() {
    const list: objectMapInfo[] = [];
    this.players.forEach((player, index) => {
      const mirror = index === 0 ? true : false;
      const center = gameField[0] / 2;
      const xPositions = [center - 100, center - 20, center + 80];
      const yPosition = mirror ? 0 : 1000;
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
    const listMsg: objectInfo = {
      action: actionList.objectcreate,
      list: list,
    };
    this.players.forEach((player) => {
      player.ws.send(JSON.stringify(listMsg));
    });
  }

  public StarDestroy(owner: string) {
    let winner = 0;
     this.players.forEach((player, index) => {
      player.ws.send(JSON.stringify({
        wallet: owner,
        msg: 'Star destroyed'
      }))
         if(player.publicKey === owner) {
           winner = index === 0 ? 1 : 0;
         }
     })
     this.Finish(winner);
  }

  private Finish(winner: number | null = null) {
    this.isActive = false;
    clearInterval(this.shipCreationTimer);
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
