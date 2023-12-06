import { WriteLog } from '../../database/log';
import GameObject from './GameObject';
import { play } from '../types';
import { FrameInterval, SyncInterval, defCoords, gameField, planetRotationSpeed, planetYearAngle } from '../config';
import { GameRoom } from '../core/Room';
import { Classes, PackTitle } from '../types/Messages';
import ObjectListManager from '../core/ListManager';
import { PackFactory } from 'game/utils/PackFactory';

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
    _radius: number,
    _manager: ObjectListManager<any>,
    dir: boolean,
  ) {
    super(_room, _owner, _coords, _radius, Classes.planet, _manager);
    this.dir = dir;
    this.defY = this.center.y + defCoords.orbDiam / 2;
    this.onCreate();
  }

  public onCreate() {
    // WriteLog(this.owner, 'Planet placed');

    this.timer = setInterval(() => {
      this.center.x =
        gameField[0] / 2 +
        defCoords.orbDiam * (this.dir ? -1 : 1) * Math.cos(this.angle);
      this.center.y =
        this.defY +
        defCoords.orbDiam * (this.dir ? -1 : 1) * Math.sin(this.angle);

      this.angle += planetYearAngle;
      this.rotation += planetRotationSpeed;

      if (this.angle >= Math.PI * 2) {
        this.angle -= Math.PI * 2;
      }
    }, FrameInterval);

    this.syncTimer = setInterval(() => {
      this.room.ReSendMessage(PackFactory.getInstance().objectUpdate([{
        id: this.id,
        position: this.center,
        rotation: this.rotation
      }]));
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
