import { classes } from "../types/msg";
import { FrameInterval } from "../config";
import ObjectListManager from "./ListManager";
import { GameRoom } from "./Room";

export default class ActionManager {
    private timers: NodeJS.Timer[];
    private manager: ObjectListManager<any>;
    private room: GameRoom;

    constructor(_manager: ObjectListManager<any>, _room: GameRoom) {
        this.manager = _manager;
        this.room = _room;
    }

    public GameStart() {
        const mainTimer = setInterval(() => {
           const ships = this.manager.getObjectsByClassName(classes.ship);
           if (ships.length > 0) {
             this.room.SendLog("Ships found")
           }
        }, FrameInterval)
        this.timers.push(mainTimer)
    }

    public GameEnd() {
        this.timers.forEach((t) => {
            clearInterval(t)
        })
    }
}