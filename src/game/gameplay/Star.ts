import { WriteLog } from '../../database/log';
import GameObject from './GameObject';
import { play } from '../types';
import { GameRoom } from '../core/Room';
import { defShipHealth } from '../config';

export default class Star extends GameObject {
  public energy: number;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _sprite: play.sprite,
  ) {
    super(_room, _owner, _coords, _sprite, 'star');
    this.onCreate();
  }

  protected onCreate() {
    // WriteLog(this.owner, 'Star placed');
    this.energy = defShipHealth;
  }

  protected onDestroy() {
    this.room.StarDestroy(this.owner);
  }

  public TakeDamage(damage: number) {
    this.energy -= damage;
    if (this.energy <= 0) {
      this.destroy();
    }
  }

  public destroy = () => {
    this.onDestroy();
  };
}
