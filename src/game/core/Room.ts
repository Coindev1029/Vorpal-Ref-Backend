import { PlayerRow } from '../types/interfaces';
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
    this.isActive = true
    setTimeout(() => {
      this.Finish();
    }, roomTestTimeout);
  }

  public Finish() {
    this.isActive = false
    const winner = Math.ceil(Math.random() * 2) === 0 ? 0 : 1; // REPLACE!!!
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
      player.ws.send(JSON.stringify({ action : "gameend", win: winner === index ? true : false }));
    });
  }
}
