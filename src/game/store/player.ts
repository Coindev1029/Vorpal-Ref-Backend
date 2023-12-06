import { play } from '../types';
import ObjectListManager from '../core/ListManager';
import { GameRoom } from '../core/Room';
import { actionList } from '../types/Messages';
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
    private inventory: Map<string, number>;

    constructor(_address: string, _race: race) {
       this.addr = _address;
       this.rc = _race;
       this.gld = playerStartGold
       this.lvl = 0;
       this.exp = 0;
       this.inventory = new Map<string, number>();
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

    public AddItem (name: string, amount: number): boolean {
        if (amount <= 0) {
            return false;
        }

        const current = this.inventory.get(name)

        if (current) {
            this.inventory.set(name, current + amount)
            return true;
        } else {
            this.inventory.set(name, amount)
            return true;
        }
    }

    public UseItem (name: string): boolean  {
        const current = this.inventory.get(name)

        if (!current) {
            return false;
        }

        this.inventory.set(name, current - 1)
        return true;

    }

    public getItemCount (name: string): number {
        const current = this.inventory.get(name);
        if (!current) {
            return 0;
        }

        return current;
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