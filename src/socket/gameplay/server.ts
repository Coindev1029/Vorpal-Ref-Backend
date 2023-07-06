import { gameTimerValue } from "socket/config"
import { GetPlayerList, GetPlayerStateList } from "socket/state";

export class GameServer {
    private timer: any;
  
    public InitServer(): void {
      this.timer = setInterval(() => {
        const players = GetPlayerList();
        const playerStates = GetPlayerStateList ()
        // Perform server initialization logic here
      }, gameTimerValue);
    }

    public CloseServer(): void {
        return clearInterval(this.timer)
    }

  }