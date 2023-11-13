import { WriteLog } from '../../database/log';
import GameObject from './GameObject';
import { play } from '../types';
import { FrameInterval, SyncInterval, defCoords, gameField, planetRotationSpeed } from '../config';
import { GameRoom } from '../core/Room';
import { actionList } from '../types/msg';

export default class Planet extends GameObject {
  private timer: NodeJS.Timer;
  private syncTimer: NodeJS.Timer;
  private dir: boolean;
  private angle = 0;
  private defY = 0;
  private rotation = 0;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _sprite: play.sprite,
    dir: boolean,
  ) {
    super(_room, _owner, _coords, _sprite, 'planet');
    this.dir = dir;
    this.defY = _coords.y + _sprite.height / 2 + defCoords.orbDiam / 2;
    this.onCreate();
  }

  public onCreate() {
    // WriteLog(this.owner, 'Planet placed');

    this.timer = setInterval(() => {
      this.rect.x =
        gameField[0] / 2 +
        defCoords.orbDiam * (this.dir ? -1 : 1) * Math.cos(this.angle);
      this.rect.y =
        this.defY +
        defCoords.orbDiam * (this.dir ? -1 : 1) * Math.sin(this.angle);

      this.angle += 0.004185;
      this.rotation += planetRotationSpeed;

      if (this.angle >= Math.PI * 2) {
        this.angle -= Math.PI * 2;
      }
    }, FrameInterval);

    this.syncTimer = setInterval(() => {
       this.room.ReSendMessage(JSON.stringify({
          action: actionList.objectupdate,
          id: this.id,
          coords: this.center(),
          data: {
            owner: this.owner,
            angle: this.angle,
            rotation: this.rotation
          }
       }))
    }, SyncInterval)
  }

  protected onDestroy() {
    clearInterval(this.timer);
    clearInterval(this.syncTimer);
  }

  public Rotation() {
    return this.rotation;
  }

  public destroy = () => {
    this.onDestroy();
  };
}
