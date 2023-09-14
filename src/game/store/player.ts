import { play } from '../types';
import ObjectListManager from '../core/ListManager';
import { GameRoom } from '../core/Room';
import { actionList } from '../types/msg';
import GameObject from '../gameplay/GameObject';
import { defBattleShipHealth, playerExpPerLevel, playerMaxLevel, playerStartGold } from '../config';
import Star from '../gameplay/Star';
import { race } from '../types/user';

export default class Player {
    private addr: string;
    private rc: string;
    private gld: number;
    private lvl: number;
    private exp: number;

    constructor(_address: string, _race: race) {
       this.addr = _address;
       this.rc = _race;
       this.gld = playerStartGold
       this.lvl = 0;
       this.exp = 0;
    }

    public UpdateGold (amount: number) {
        if (this.gld + amount < 0) {
            return false;
        } 
        this.gld += amount;
        return true;
    }

    private LevelUp() {
        if (this.lvl < playerMaxLevel) {
            this.lvl +=1;
        }
    }

    public UpdateExp(_exp: number) {
        if (_exp <= 0) {
            return false
        }

        this.exp += _exp;

        if (this.exp - (this.lvl * playerExpPerLevel) > playerExpPerLevel) {
            this.LevelUp()
        }
        return true
    }

    public address(): string {
        return this.addr;
    }

    public gold(): number {
        return this.gld;
    }

    public level(): number {
        return this.lvl;
    }

    public experience(): number {
        return this.exp;
    }

}