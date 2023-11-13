import { coords } from '../types/gameplay';
import { play } from '../types';
import { GameRoom } from '../core/Room';
import { FrameInterval } from '../config';
import { actionList } from '../types/msg';

export default abstract class GameObject {
  protected id: string = '';
  protected movingTimer: NodeJS.Timer;
  protected isIdassigned: boolean;
  protected room: GameRoom;

  public rect: play.rect;
  public radius: number;
  public RoomAction: any;
  public owner: string;
  public class: string;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _sprite: play.sprite,
    _class: string,
  ) {
    this.room = _room;
    this.owner = _owner;
    this.radius = _sprite.width / 2;
    this.rect = {
      ..._coords,
      ..._sprite,
    };
    this.class = _class;
  }

  public StartMoving(angle: number = 0, speed: number = 0, finish: coords | null = null) {
    this.movingTimer = setInterval(() => {
      this.rect.x += speed * Math.cos(angle);
      this.rect.y += speed * Math.sin(angle);
      if (finish) {
        if (this.rect.x >= finish.x || this.rect.y >= finish.y) {
          this.StopMoving();
        }
      }
    }, FrameInterval);
  }

  public StopMoving() {
    return clearInterval(this.movingTimer);
  }

  public assignId(_id: string): boolean {
    if (!this.isIdassigned) {
      this.id = _id;
      this.isIdassigned = true;
      return true;
    } else {
      return false;
    }
  }

  public getId(): string {
    return this.id;
  }

  public center(): coords {
    return {
      x: this.rect.x + this.rect.width / 2,
      y: this.rect.y + this.rect.height / 2,
    };
  }

  abstract destroy: () => void;
}
