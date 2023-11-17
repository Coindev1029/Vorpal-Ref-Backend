import { coords, rect } from '../types/gameplay';
import { play } from '../types';
import { GameRoom } from '../core/Room';
import { FrameInterval, idLength, moveFrame } from '../config';
import { actionList } from '../types/msg';

export default abstract class GameObject {
  protected id: string = '';
  protected room: GameRoom;
  protected inMoving =  false;
  protected moveTimer: NodeJS.Timer;

  public center: play.coords;
  public radius: number;
  public RoomAction: any;
  public owner: string;
  public class: string;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _radius: number,
    _class: string,
  ) {
    const _id = this.GenerateId(idLength);
    this.room = _room;
    this.owner = _owner;
    this.radius = _radius;
    this.id = _id;
    this.center = {
      ..._coords,
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

  public async MoveTo(target: coords, time: number ) : Promise<coords> {
    return await new Promise ((resolve, reject) => {
      if (this.inMoving) {
         reject(1)
      }
      this.inMoving = true;
      const frames = Math.ceil(time / moveFrame)
      const point : coords = {x: target.x, y: target.y}
      const step : coords = {x: (point.x - this.center.x) / frames, y: (point.y - this.center.y) / frames}
      this.room.ReSendMessage(JSON.stringify({
        action: actionList.objectupdate,
        id: this.id,
        data: {
           event: 'startmoving',
           target: target,
           timeTo: time
        }
      }))
      let timePast = 0
      this.moveTimer = setInterval(() => {
        timePast += moveFrame;
        this.center.y += step.y;
        this.center.x += step.x;
        if (timePast >= time) {
          clearInterval(this.moveTimer);
          this.center.x = target.x;
          this.center.y = target.y;
          this.room.ReSendMessage(JSON.stringify({
            action: actionList.objectupdate,
            id: this.id,
            data: {
               event: 'stopmoving',
               position: this.center,
            }
          }))
          this.inMoving = false;
          resolve(this.center)
        }
      }, moveFrame)
    })
  }

  public getId(): string {
    return this.id;
  }

  /* public center(): coords {
    return {
      x: this.rect.x + this.rect.width / 2,
      y: this.rect.y + this.rect.height / 2,
    };
  } */

  abstract destroy: () => void;
}
