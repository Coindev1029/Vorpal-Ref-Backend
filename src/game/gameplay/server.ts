import WebSocket, { Server } from 'ws';
import Web3 from 'web3';
import { WriteLog } from '../../database/log';
import { gameTimerValue, signTimeout } from '../config';
import { GameRoom } from './room';
import { PlayerState, playerStateKeys } from '../types';
import { IncomingMessage } from 'http';
import { actionList } from '../types/msg';

const web3 = new Web3(Web3.givenProvider);

export class GameServer {
  private timer: any;
  private rooms: GameRoom[];
  private ws_port = Number(process.env.WS_PORT ? process.env.WS_PORT : 3078);
  private wss: Server<typeof WebSocket, typeof IncomingMessage> | null = null;
  private players = new Map<string, WebSocket>();
  private playerStates = new Map<string, PlayerState>();
  private playerKeys = new Map<string, string>();
  private playerDefaultState: PlayerState = {
    auth: true,
    inLookingFor: false,
    inGame: false,
    starId: -1,
    planetId: -1,
    roomId: -1,
  };

  public SelectIndexes(max: number): number[] {
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

  private GetRoomId(room: GameRoom): number {
    return this.rooms.indexOf(room);
  }

  private GetPlayerConnectionById(playerId: string): WebSocket | undefined {
    return this.players.get(playerId);
  }

  private UpdatePlayerStateSingle(
    playerId: string,
    action: playerStateKeys,
    value: number | boolean,
  ): boolean {
    const actualState = this.playerStates.get(playerId);
    if (!actualState) {
      return false;
    }
    const newState: PlayerState = {
      auth: action == 'connected' ? Boolean(value) : actualState.auth,
      inLookingFor:
        action == 'inLookingFor' ? Boolean(value) : actualState.inLookingFor,
      inGame: action == 'inGame' ? Boolean(value) : actualState.inGame,
      planetId: action == 'planetId' ? Number(value) : actualState.starId,
      starId: action == 'starId' ? Number(value) : actualState.planetId,
      roomId: action == 'roomId' ? Number(value) : actualState.roomId,
    };
    this.playerStates.set(playerId, newState);
    return true;
  }

  private UpdatePlayerStateFull(playerId: string, state: PlayerState): boolean {
    const actualState = this.playerStates.get(playerId);
    if (!actualState) {
      return false;
    }
    this.playerStates.set(playerId, state);
    return true;
  }

  private RoomGenerator() {
    WriteLog('0x01', 'Room generation started ...');
    return setInterval(() => {
      const activeIds: string[] = [];
      this.playerStates.forEach((item, key) => {
        if (item.inLookingFor === true) {
          activeIds.push(key);
        }
      });
      // WriteLog('0x08', 'Room creation, players : ' + activeIds.length);
      if (activeIds.length > 1) {
        const indexPair = this.SelectIndexes(activeIds.length);
        WriteLog('0x08', 'Room creation, players : ' + String(indexPair));
        const newKeys: string[] = [
          activeIds[indexPair[0]],
          activeIds[indexPair[1]],
        ];
        WriteLog('0x08', 'Room creation, players : ' + String(newKeys[0]));
        const p1 = this.players.get(newKeys[0]);
        const p2 = this.players.get(newKeys[1]);
        WriteLog('0x08', 'Room creation, ws1 : ' + String(p1?.url));
        if (p1 && p2) {
          const room = new GameRoom(p1, p2, newKeys[0], newKeys[1]);
          this.rooms.push(room);
          WriteLog('0x08', 'Game room created, id : ' + this.rooms.length);
          this.UpdatePlayerStateFull(newKeys[0], {
            auth: true,
            inGame: true,
            inLookingFor: false,
            planetId: this.playerStates[newKeys[0]].planetId,
            starId: this.playerStates[newKeys[0]].starId,
            roomId: this.rooms.length,
          });
          this.UpdatePlayerStateFull(newKeys[1], {
            auth: true,
            inGame: true,
            inLookingFor: false,
            planetId: this.playerStates[newKeys[1]].planetId,
            starId: this.playerStates[newKeys[1]].starId,
            roomId: this.rooms.length,
          });
          room.Start();
        }
      }

      // Perform server initialization logic here
    }, gameTimerValue);
  }

  private CreatePlayer(ws: WebSocket, publicKey: string): string {
    for (const [key, val] of this.playerKeys.entries()) {
      if (val === publicKey) {
        return '';
      }
    }
    const sId = String(Math.round(Math.random() * 1000000000));

    this.players.set(sId, ws);
    WriteLog('0x012', this.players.get(sId)?.isPaused)
    this.playerStates.set(sId, this.playerDefaultState);
    this.playerKeys.set(sId, publicKey);
    return sId;
  }

  private RemovePlayer(playerId: string): string {
    this.players.delete(playerId);
    this.playerStates.delete(playerId);
    this.playerKeys.delete(playerId);
    return playerId;
  }

  private GetPlayerId(ws: WebSocket): string | undefined {
    for (const [key, val] of this.players.entries()) {
      if (val === ws) {
        return key;
      }
    }
  }

  public InitServer(): void {
    this.wss = new WebSocket.Server({ port: this.ws_port });
    WriteLog('0x00', 'Game server created : ' + JSON.stringify(this.wss));
    this.timer = this.RoomGenerator();
    this.wss.on('connection', (ws: WebSocket) => {
      WriteLog('0x00', 'New connection');
      ws.send(JSON.stringify({ action: 'auth', state: 'requesting' }));
      const authTimeout = setTimeout(() => {
        const playerId = this.GetPlayerId(ws);
        if (!playerId || !this.playerStates.get(playerId)?.auth) {
          WriteLog('0x07', 'Not authorized, closing...')
          ws.send(
            JSON.stringify({
              action: 'unauth',
              message: 'Auth time expired',
            }),
          );
          // ws.close();
        }
      }, signTimeout);

      ws.on('message', (message: string) => {
        WriteLog('0x00', 'Received : ' + message);
        let msg: any;
        try {
          msg = JSON.parse(message);
        } catch (e) {
          return;
        }

        if (!msg.action) {
          return;
        }

        switch (msg.action) {
          case actionList.auth:
            if (!msg.signature) {
              return;
            } else {
              const dt = new Date().getTime();
              const recoverMsg = 'auth_' + String(dt - (dt % 600000));
              const publicKey = web3.eth.accounts
                .recover(recoverMsg, msg.signature)
                .toLowerCase();
              const playerId = this.CreatePlayer(ws, publicKey);
              if (!playerId) {
                ws.send(
                  JSON.stringify({
                    action: actionList.unauth,
                    message:
                      'Auth failed, player with this key is already online',
                  }),
                );
              } else {
                ws.send(
                  JSON.stringify({
                    action: actionList.auth,
                    state: 'success',
                    playerId: playerId,
                  }),
                );
                clearTimeout(authTimeout);
              }
            }
            break;
          case actionList.entergame:
            const playerId = this.GetPlayerId(ws);
            if (playerId) {
              const pState = this.playerStates.get(playerId);
              if (pState && (pState.inGame || pState.inLookingFor)) {
                ws.send(
                  JSON.stringify({
                    action: actionList.entergame,
                    state: 'error',
                    message: 'Player is already entered',
                    playerId: playerId,
                  }),
                );
                return;
              }
              ws.send(
                JSON.stringify({
                  action: actionList.entergame,
                  state: 'success',
                  message: 'Player now in queue',
                  playerId: playerId,
                }),
              );
              this.UpdatePlayerStateSingle(playerId, 'inLookingFor', true);
              WriteLog('0x09', `Player ${playerId} now in game queue`);
            }
            break;
          default:
            return;
        }
      });

      ws.on('close', () => {
        const pId = this.GetPlayerId(ws);
        if (pId) {
          this.RemovePlayer(pId);
        }
      });
    });
  }

  public CloseServer(): void {
    this.wss = null;
    return clearInterval(this.timer);
  }
}
