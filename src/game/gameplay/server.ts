import { WriteLog } from '../../database/log';
import { gameTimerValue } from '../config';
import {
  GetPlayerList,
  GetPlayerStateList,
  UpdatePlayerStateFull,
  UpdatePlayerStateSingle,
} from '../state';
import { GameRoom } from './room';

export class GameServer {
  private timer: any;
  private rooms: GameRoom[];

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

  public InitServer(): void {
    WriteLog('0x00', 'Game server created');
    this.timer = setInterval(() => {
      const players = GetPlayerList();
      const playerStates = GetPlayerStateList();
      const activeIds: string[] = [];
      playerStates.forEach((item, key) => {
        if (item.inLookingFor === true) {
          activeIds.push(key);
        }
      });
      WriteLog('0x01', 'Players count : ' + activeIds.length);

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

  public CloseServer(): void {
    return clearInterval(this.timer);
  }
}
