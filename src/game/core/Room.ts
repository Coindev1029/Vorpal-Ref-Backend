import { PlayerRow, UserEvent } from '../types/interfaces';
import { GameIoServer } from './Server';
import { PlayerState } from '../types';
import { WriteLog } from '../../database/log';
import { roomTestTimeout } from '../config';

export class GameRoom {
  private players: PlayerRow[] = [];
  private server: GameIoServer;
  private roomItselfId: number = -1;
  private isActive: boolean = false;
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
    }, roomTestTimeout);
  }

  private Finish(winner: number | null = null) {
    this.isActive = false;
    if (winner === null) winner = Math.ceil(Math.random() * 2) === 0 ? 0 : 1; // REPLACE!!!
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
