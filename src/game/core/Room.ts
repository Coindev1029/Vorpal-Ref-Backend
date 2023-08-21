import { PlayerRow, UserEvent } from '../types/interfaces';
import { GameIoServer } from './Server';
import { PlayerState } from '../types';
import { WriteLog } from '../../database/log';
import * as config from '../config';
import GameObject from '../gameplay/GameObject';
import Star from '../gameplay/Star';

class ObjectListManager<T extends GameObject> {
      private idLength = 64;
      public objectList :  Map<string, T>;

      constructor() {
        this.objectList = new Map();
      }

      public GenerateId (length : number) : string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
    
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
    
        return result;
      }

    addObject(object: T): string {
        const newObjects = new Map(this.objectList);
        const newId = this.GenerateId (this.idLength);
        newObjects.set(newId, object);
        this.objectList = newObjects;
        return newId;
    }

    removeObject(id: string): T[] {
        if (!this.objectList.has(id)) {
            return this.getAllObjects();
        }
        const newObjects = new Map(this.objectList);
        newObjects.delete(id);
        this.objectList = newObjects;
        return this.getAllObjects();
    }

    getObject(id: string): T | undefined {
        return this.objectList.get(id);
    }

    getAllObjects(): T[] {
        return Array.from(this.objectList.values());
    }
}

export class GameRoom {
  private players: PlayerRow[] = [];
  private server: GameIoServer;
  private roomItselfId: number = -1;
  private isActive: boolean = false;
  private manager : ObjectListManager<any>;
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
    setTimeout(() => {
      this.Finish();
    }, config.roomTestTimeout);
    const star1 = new Star(this.players[0].publicKey, config.defCoords.star1, config.defCoords.sprites.star)
    const star2 = new Star(this.players[1].publicKey, config.defCoords.star2, config.defCoords.sprites.star)
    this.manager = new ObjectListManager()
    this.manager.addObject(star1),
    this.manager.addObject(star2)
  }

  private Finish(winner: number | null = null) {
    this.isActive = false;
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
    const dt = new Date()
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
