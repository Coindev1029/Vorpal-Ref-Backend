import WebSocket, { Server } from 'ws';
import { default_ws_port, pingPongDelay } from '../config';
import { WriteLog } from '../../database/log';
import { PlayerState } from '../types';

interface Player {
  id: string;
  ws: WebSocket;
  publicKey: string;
}
interface PlayerRow extends Player {
  state: PlayerState;
}

export class GameIoServer {
  private players: PlayerRow[] = [];
  private ws_port = Number(
    process.env.WS_PORT ? process.env.WS_PORT : default_ws_port,
  );
  // private wss = new WebSocket.Server({ port: this.ws_port });
  private timer: any;
  private playerDefaultState: PlayerState = {
    auth: true,
    inLookingFor: false,
    inGame: false,
    starId: -1,
    planetId: -1,
    roomId: -1,
  };

  private GenerateId(): string {
    return String(Math.round(Math.random() * 1000000000));
  }

  private InsertPlayer(player: Player): boolean {
    this.players.push({
      id: player.id,
      ws: player.ws,
      publicKey: player.publicKey,
      state: this.playerDefaultState,
    });
    return true;
  }

  private DeletePlayer(id: string) {
    const newPlayerList: PlayerRow[] = [];
    this.players.forEach((player) => {
      if (player.id !== id) {
        newPlayerList.push(player);
      }
    });
    this.players = newPlayerList;
  }

  public Start() {
    const wss = new WebSocket.Server({ port: this.ws_port });
    wss.on('connection', (ws: WebSocket) => {
      const cId = this.GenerateId();
      this.InsertPlayer({
        id: cId,
        ws: ws,
        publicKey: '',
      });
      WriteLog('0x0032', 'New connection, id : ' + cId);
      ws.send('Connection confirmed');
      ws.on('message', (message: string) => {
        if (message === 'ping') {
          ws.send('pong');
        }
      });
      ws.on('close', () => {
        this.DeletePlayer(cId);
      });
    });
    this.timer = setInterval(() => {
      this.players.forEach((player) => {
        player.ws.send('pong');
      });
    }, pingPongDelay);
    return true;
  }

  public Finish() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    return true;
  }
}
