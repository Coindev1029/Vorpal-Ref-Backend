import { play } from '../types';
import ObjectListManager from '../core/ListManager';
import { GameRoom } from '../core/Room';
import { actionList } from '../types/msg';
import GameObject from '../gameplay/GameObject';
import { defBattleShipHealth, playerStartGold } from '../config';
import Star from '../gameplay/Star';
import Player from './player';
import { race } from '../types/user';

export default class Store {
    private players =  new Map<string, Player>();
    

    constructor(_address1, _address2, _race1: race, _race2: race) {
        this.players.set(_address1, new Player(_address1, _race1))
        this.players.set(_address2, new Player(_address2, _race2))
    }

}