import WebSocket from 'ws';
import { WriteLog } from '../../database/log';
import { gameTimerValue } from '../config';
import {
  GetPlayerList,
  GetPlayerStateList,
  UpdatePlayerStateFull,
  UpdatePlayerStateSingle,
} from '../state';
import { GameRoom } from './room';
import { PlayerState } from 'game/types';

export class GameServer {
  private timer: any;
  private rooms: GameRoom[];
  private ws_port = Number(process.env.WS_PORT ? process.env.WS_PORT : 3078);
  private wss = new WebSocket.Server({ port: this.ws_port });
  private players = new Map<string, WebSocket>();
  private playerStates = new Map<string, PlayerState>();
  private playerKeys = new Map<string, string>();
  private playerDefaultState: PlayerState = {
    connected: false,
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

  public GetRoomId(room: GameRoom): number {
    return this.rooms.indexOf(room);
  }

  private RoomGenerator() {
    WriteLog('0x01', 'Room generation started ...');
    return setInterval(() => {
      const players = GetPlayerList();
      const playerStates = GetPlayerStateList();
      const activeIds: string[] = [];
      playerStates.forEach((item, key) => {
        if (item.inLookingFor === true) {
          activeIds.push(key);
        }
      });

      if (activeIds.length > 1) {
        const indexPair = this.SelectIndexes(activeIds.length);
        const newKeys: string[] = [
          activeIds[indexPair[0]],
          activeIds[indexPair[1]],
        ];
        const p1 = players.get(newKeys[0]);
        const p2 = players.get(newKeys[1]);
        if (p1 && p2) {
          const room = new GameRoom(p1, p2, newKeys[0], newKeys[1]);
          this.rooms.push(room);
          UpdatePlayerStateFull(newKeys[0], {
            connected: true,
            inGame: true,
            inLookingFor: false,
            planetId: playerStates[newKeys[0]].planetId,
            starId: playerStates[newKeys[0]].starId,
            roomId: this.rooms.length,
          });
          UpdatePlayerStateFull(newKeys[1], {
            connected: true,
            inGame: true,
            inLookingFor: false,
            planetId: playerStates[newKeys[1]].planetId,
            starId: playerStates[newKeys[1]].starId,
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

  public InitServer(): void {
    WriteLog('0x00', 'Game server created');
    this.timer = this.RoomGenerator();
  }

  public CloseServer(): void {
    return clearInterval(this.timer);
  }
}
