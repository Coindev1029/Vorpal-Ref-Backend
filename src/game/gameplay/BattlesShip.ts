import { play } from '../types';
import ObjectListManager from '../core/ListManager';
import { GameRoom } from '../core/Room';
import { actionList } from '../types/msg';
import GameObject from './GameObject';

export class BattlesShip extends GameObject {
    private timer: NodeJS.Timer;
    private dir;
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

  public destroy = () => {
    this.onDestroy();
  };
}