import { contractWatchingTimeout } from "../../blockchain/config";
import { StarData, StarList } from "../../types";
import { GetAllStarData } from "./getter";
import { WriteLog } from "../../database/log";

export let actualStarList: StarList = [];
let watchingTimer: NodeJS.Timer;

export function StartWatchingTimer () {
    GetAllStarData().then((res) => {
        actualStarList = res
        console.log(actualStarList)
    }).catch(e => {
        console.log(e)
    }) ;
    watchingTimer = setInterval(async () => {
       try {
          const stars = await GetAllStarData();
          if (stars) {
            actualStarList = stars;
          }
          console.log(actualStarList)
       } catch (e) {
        console.log(e.message)
        // WriteLog("Failed to load stars", e.message);
       }
    }, contractWatchingTimeout)
}

export function StopWatchingTimer () {
    if (watchingTimer) {
        clearInterval(watchingTimer);
    }
}