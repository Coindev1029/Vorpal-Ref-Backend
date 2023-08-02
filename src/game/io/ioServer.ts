import WebSocket, { Server } from 'ws';
import { createServer } from 'http';
import { default_ws_port, pingPongDelay } from 'game/config';
import { WriteLog } from 'database/log';

interface WSRow {
        id: string,
        ws: WebSocket
  }

export class GameIoServer {
  private players: WSRow[] = [];
  private ws_port = Number(
    process.env.WS_PORT ? process.env.WS_PORT : default_ws_port,
  );
  private wss = new WebSocket.Server({ port: this.ws_port });
    private timer: any;
    
 private GenerateNewId() {
      return String(Math.round(Math.random() * 1000000000));
  }

  public Start() {
      this.wss.on('connection', (ws: WebSocket) => {
        const cId = this.GenerateNewId();
          this.players.push({
              id: cId,
              ws: ws
          });
      WriteLog('0x0032', 'New connection, id : ' + cId + ' ws : ' + JSON.stringify(ws));
      ws.on('message', (message: string) => {
        if (message === 'ping') {
          ws.send('pong');
        }
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
