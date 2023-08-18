import { WriteLog } from '../../database/log';
import GameObject from './GameObject';
import { play } from '../types';

export default class Star extends GameObject {
  constructor(_owner: string, _coords: play.coords, _sprite: play.sprite) {
    super(_owner, _coords, _sprite);
    this.onCreate();
  }

  public onCreate() {
    WriteLog(this.owner, 'Star placed');
  }
}
