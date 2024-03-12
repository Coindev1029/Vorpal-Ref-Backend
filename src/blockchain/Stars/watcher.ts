import { contractWatchingTimeout } from "../../blockchain/config";
import { StarData, StarList } from "../../types";
import { GetAllStarData } from "./getter";
import { WriteLog } from "../../database/log";

export let actualStarList: StarList = [];
export let lastUpdateRequqstTime = 0;
let watchingTimer: NodeJS.Timer;

export function UpdateLastTime (time: number) {
    lastUpdateRequqstTime = time;
}

export async function UpdateStars() {
    try {
        const stars = await GetAllStarData();
        if (stars) {
          actualStarList = stars;
        }
     } catch (e) {
      WriteLog("Failed to load stars", e.message);
     }
}

export function StartWatchingTimer () {
    GetAllStarData().then((res) => {
        actualStarList = res
        console.log(actualStarList)
    }).catch(e => {
        console.log(e)
    }) ;
    watchingTimer = setInterval(async () => {
        UpdateStars()
    }, contractWatchingTimeout)
}

export function StopWatchingTimer () {
    if (watchingTimer) {
        clearInterval(watchingTimer);
    }
}