import { WriteLog } from '../../database/log';
import GameObject from './GameObject';
import { play } from '../types';
import { GameRoom } from '../core/Room';
import { defShipHealth, defStarHealth } from '../config';
import { actionList, classes } from '../types/msg';

export default class Star extends GameObject {
  public energy: number;
  private lifeTimer: NodeJS.Timer;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _radius: number,
  ) {
    super(_room, _owner, _coords, _radius, classes.star);
    this.onCreate();
  }

  protected onCreate() {
    // WriteLog(this.owner, 'Star placed');
    this.energy = defStarHealth;

    this.lifeTimer = setInterval(() => {
      this.TakeDamage(1)
    }, 1000)
  }

  protected onDestroy() {
    clearInterval(this.lifeTimer);
    this.room.StarDestroy(this.owner, this.id);
  }

  public TakeDamage(damage: number) {
    this.energy -= damage;
    if (this.energy <= 0) {
      this.destroy();
    } else {
      this.room.ReSendMessage(JSON.stringify({
        action: actionList.objectupdate,
        id: this.id,
        enegry: this.energy
      }))
    }
  }

  public destroy = () => {
    this.onDestroy();
  };
}
