import GameObject from './GameObject';
import { play } from '../types';
import { defCoords, shipMovingTime } from '../config';
import { GameRoom } from '../core/Room';

export class Ship extends GameObject {
  private timer: NodeJS.Timer;
  private dir: boolean = true; // true - up, false - down

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _sprite: play.sprite,
    dir: boolean,
  ) {
    super(_room, _owner, _coords, _sprite, 'ship');
    this.dir = dir;
    this.onCreate();
  }

  protected onCreate() {
     setTimeout(() => {
        this.rect.y = defCoords.battleLine + (50 * (this.dir ? -1 : 1));
     }, shipMovingTime)
  }

  protected onDestroy() {
       clearInterval(this.timer)
    }
    
  public destroy = () => {
    this.onDestroy()
  }

}