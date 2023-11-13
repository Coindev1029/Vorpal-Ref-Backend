import { coords, rect } from '../types/gameplay';
import { play } from '../types';
import { GameRoom } from '../core/Room';
import { FrameInterval, idLength, moveFrame } from '../config';
import { actionList } from '../types/msg';

export default abstract class GameObject {
  protected id: string = '';
  protected room: GameRoom;
  protected inMoving =  false;

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
    const _id = this.GenerateId(idLength);
    this.room = _room;
    this.owner = _owner;
    this.radius = _sprite.width / 2;
    this.id = _id;
    this.rect = {
      ..._coords,
      ..._sprite,
    };
    this.class = _class;
  }

  public GenerateId(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  public async MoveTo(target: coords, time: number ) : Promise<rect> {
    return await new Promise ((resolve, reject) => {
      if (this.inMoving) {
         reject(1)
      }
      this.inMoving = true;
      const frames = Math.ceil(time / moveFrame)
      const point : coords = {x: target.x - this.radius, y: target.y - this.radius}
      const step : coords = {x: (point.x - this.rect.x) / frames, y: (point.y - this.rect.y) / frames}
      this.room.ReSendMessage(JSON.stringify({
        action: actionList.objectupdate,
        id: this.id,
        data: {
           event: 'startmoving',
           target: point,
           timeTo: time
        }
      }))
      let timePast = 0
      const moveTimer = setInterval(() => {
        timePast += moveFrame;
        this.rect.y += step.y;
        this.rect.x += step.x;
        if (timePast >= time) {
          clearInterval(moveTimer);
          this.room.ReSendMessage(JSON.stringify({
            action: actionList.objectupdate,
            id: this.id,
            data: {
               event: 'stopmoving',
               position: this.center(),
            }
          }))
          this.inMoving = false;
          resolve(this.rect)
        }
      }, moveFrame)
    })
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
