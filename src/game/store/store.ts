import { play } from '../types';
import ObjectListManager from '../core/ListManager';
import { GameRoom } from '../core/Room';
import { actionList } from '../types/msg';
import GameObject from '../gameplay/GameObject';
import { defBattleShipHealth, playerStartGold } from '../config';
import Star from '../gameplay/Star';
import Player from './player';
import { race } from '../types/user';
import { ResponseObject } from '../../types';
import { priceList } from './prices';

export default class Store {
  private players = new Map<string, Player>();

  constructor(_address1, _address2, _race1: race, _race2: race) {
    this.players.set(_address1, new Player(_address1, _race1));
    this.players.set(_address2, new Player(_address2, _race2));
  }

  public UseItem(_player: string, _name: string): ResponseObject {
    const player = this.players.get(_player);
    if (!player) {
      return {
        success: false,
        message: 'Player not found',
      };
    }

    const count = player.getItemCount(_name);

    if (count < 1) {
      return {
        success: false,
        message: 'Insufficient item balance',
      };
    }

    return {
      success: player.UseItem(_name),
      message: `${player.getItemCount(_name)}`,
    };
  }

  public BuyItem(
    _player: string,
    _name: string,
    _amount: number = 1,
  ): ResponseObject {
    const player = this.players.get(_player);
    if (!player) {
      return {
        success: false,
        message: 'Player not found',
      };
    }

    const price = priceList[_name];

    if (!price) {
      return {
        success: false,
        message: 'Item not found',
      };
    }

    const gold = player.gold();

    if (gold < price) {
      return {
        success: false,
        message: 'Insufficient balance',
      };
    }

    return {
      success: player.AddItem(_name, _amount),
      message: `${player.getItemCount(_name)}`,
    };
  }
}
