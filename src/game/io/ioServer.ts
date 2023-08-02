import WebSocket, { Server } from 'ws';
import Web3 from 'web3';
import { default_ws_port, pingPongDelay, signTimeout } from '../config';
import { WriteLog } from '../../database/log';
import { PlayerState } from '../types';
import { actionList } from '../types/msg';

interface Player {
  id: string;
  ws: WebSocket;
  publicKey: string;
}
interface PlayerRow extends Player {
  state: PlayerState;
}

const web3 = new Web3(Web3.givenProvider);

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
  private AuthRequestMsg = { action: 'auth', state: 'requesting' };

  private GenerateId(): string {
    return String(Math.round(Math.random() * 1000000000));
  }

  private AuthMsg(): string {
    const dt = new Date().getTime();
    return 'auth_' + String(dt - (dt % 600000));
  }

  private SelectIndexes(max: number): number[] {
    const indexes: number[] = [];
    const indexOne = Math.floor(Math.random() * (max + 1));
    indexes.push(indexOne);
    while (true) {
      const indexTwo = Math.floor(Math.random() * (max + 1));
      if (indexTwo !== indexOne) {
        indexes.push(indexTwo);
        break;
      }
    }
    return indexes;
  }

  private GetPlayerByParam(param: WebSocket | string): PlayerRow | null {
    this.players.forEach((player) => {
      if (
        player.id === param ||
        player.ws === param ||
        player.publicKey === param
      ) {
        return player;
      }
    });
    return null;
  }

  public UpdatePlayerState(id: string, state: PlayerState) {
    const newPlayerList: PlayerRow[] = [];
    this.players.forEach((player) => {
      if (player.id !== id) {
        newPlayerList.push(player);
      } else {
        newPlayerList.push({
          id: player.id,
          ws: player.ws,
          publicKey: player.publicKey,
          state: state,
        });
      }
    });
    this.players = newPlayerList;
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
      const authTimer = setTimeout(() => {
        if (!this.GetPlayerByParam(ws)) {
          ws.send(
            JSON.stringify({
              action: 'unauth',
              message: 'Auth time expired',
            }),
          );
          ws.close();
        }
      }, signTimeout);
      WriteLog('0x0032', 'New connection, id : ' + cId);
      ws.send(JSON.stringify(this.AuthRequestMsg));
      ws.on('message', (message: string) => {
        if (String(message) === 'ping') {
          ws.send('pong');
          return;
        }
        WriteLog('0x0033', 'Received : ' + message);
        let msg: any;
        try {
          msg = JSON.stringify(message);
        } catch (e) {
          return;
        }
        switch (msg.action) {
          case actionList.auth:
            if (!msg.signature) return;
            const recoverMsg = this.AuthMsg();
            const publicKey = web3.eth.accounts
              .recover(recoverMsg, msg.signature)
              .toLowerCase();
            this.players.forEach((player) => {
              if (player.publicKey === publicKey) {
                ws.send(
                  JSON.stringify({
                    action: actionList.unauth,
                    message:
                      'Auth failed, player with this key is already online',
                  }),
                );
                return;
              }
            });
            clearInterval(authTimer);
            this.InsertPlayer({
              id: cId,
              ws: ws,
              publicKey: publicKey,
            });
                ws.send(
                  JSON.stringify({
                    action: actionList.auth,
                    state: 'success',
                    playerId: publicKey,
                  }),
                );
            break;
          case actionList.entergame:
            const player = this.GetPlayerByParam(ws);
            if (player) {
              if (player.state.inLookingFor || player.state.inGame) {
                ws.send(
                  JSON.stringify({
                    action: actionList.entergame,
                    status: 'failed',
                  }),
                );
                return;
              }
              const playerNewState: PlayerState = {
                auth: true,
                inLookingFor: true,
                inGame: false,
                starId: player.state.starId,
                planetId: player.state.planetId,
                roomId: -1,
              };
              this.UpdatePlayerState(player.id, playerNewState);
              WriteLog(player.publicKey, 'Now in game : ' + player.id);
              ws.send(
                JSON.stringify({
                  action: actionList.entergame,
                  state: 'success',
                  message: 'Player now in queue',
                  playerId: player.publicKey,
                }),
              );
            }
            break;
          default:
            return;
        }
      });
      ws.on('close', () => {
        this.DeletePlayer(cId);
      });
    });
    /* this.timer = setInterval(() => {
      this.players.forEach((player) => {
        player.ws.send('pong');
      });
    }, pingPongDelay); */
    return true;
  }

  public Finish() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    return true;
  }
}
