import { play } from '../types';
import ObjectListManager from '../core/ListManager';
import { GameRoom } from '../core/Room';
import { actionList } from '../types/msg';
import GameObject from './GameObject';
import { defBattleShipHealth } from '../config';

export class BattlesShip extends GameObject {
    private timer: NodeJS.Timer;
    private dir;
    private hp: number;
    private manager: ObjectListManager<any>;

    constructor(
      _room: GameRoom,
      _owner: string,
      _coords: play.coords,
      _sprite: play.sprite,
      _manager: ObjectListManager<any>,
      dir: boolean,
    ) {
      super(_room, _owner, _coords, _sprite, 'ship');
      this.dir = dir;
      this.manager = _manager;
      this.onCreate();
    }

    private onCreate() {
        this.hp = defBattleShipHealth
    }

  private onDestroy() {
    const msg = {
        action: actionList.objectdestroy,
        data: {
          id: this.id,
        },
      };
      this.room.ReSendMessage(JSON.stringify(msg));
      this.manager.removeObject(this.id);
  }

  
  public TakeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.destroy();
    }
  }

  public destroy = () => {
    this.onDestroy();
  };
}