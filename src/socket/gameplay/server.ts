import { gameTimerValue } from "socket/config"
import { GetPlayerList, GetPlayerStateList, UpdatePlayerStateSingle } from "socket/state";
import { GameRoom } from "./room";

export class GameServer {
    private timer: any;

    public SelectIndexes(max: number): number[] {
        const indexes : number[] = []
        const indexOne = Math.floor(Math.random() * (max + 1));
        indexes.push(indexOne)
        while (true) {
            const indexTwo = Math.floor(Math.random() * (max + 1));
            if (indexTwo !== indexOne) {
                indexes.push(indexTwo)
                break;
            }
        }
        return indexes
    }
  
    public InitServer(): void {
      this.timer = setInterval(() => {
        const players = GetPlayerList();
        const playerStates = GetPlayerStateList ()
        const activeIds : string[] = []
        playerStates.forEach((item, key) => {
             if (item.inLookingFor === true) {
                activeIds.push(key)
             }
        })

        if (activeIds.length > 1) {
            const indexPair = this.SelectIndexes(activeIds.length)
            const newKeys : string[] = [activeIds[indexPair[0]], activeIds[indexPair[1]]]
            const p1 = players.get(newKeys[0])
            const p2 = players.get(newKeys[1])
            if (p1 && p2) {
                const room = new GameRoom(p1, p2)
                UpdatePlayerStateSingle(newKeys[0], "inLookingFor", false)
                UpdatePlayerStateSingle(newKeys[1], "inLookingFor", false)
                UpdatePlayerStateSingle(newKeys[0], "inGame", true)
                UpdatePlayerStateSingle(newKeys[1], "inGame", true)
            }
        }

        // Perform server initialization logic here
      }, gameTimerValue);
    }

    public CloseServer(): void {
        return clearInterval(this.timer)
    }

  }