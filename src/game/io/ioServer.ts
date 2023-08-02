import io, {Server, Socket} from 'socket.io';
import { createServer } from 'http';
import { default_ws_port, pingPongDelay } from 'game/config';
import { WriteLog } from 'database/log';

export class GameIoServer {
  private players: Socket[] = [];
  private timer: any;
  private ws_port = Number(
    process.env.WS_PORT ? process.env.WS_PORT : default_ws_port,
  );

  public Start() {
    const httpServer = createServer();
    const io = new Server(httpServer, {
      // options
    });
    httpServer.listen(this.ws_port);
    io.on('connection', (ws) => {
      this.players.push(ws);
        WriteLog('0x0032', 'New connection, id : ' + ws.id);
        ws.on('message', (message: string) => {
            if (message === 'ping') {
                ws.send('pong')
            }
        })
    });
    this.timer = setInterval(() => {
        this.players.forEach((player) => {
           player.send('pong')
       })
    }, pingPongDelay);
    return true;
  }

    public Finish() {
        if (this.timer) {
          clearInterval(this.timer)
      }
    return true;
  }
}