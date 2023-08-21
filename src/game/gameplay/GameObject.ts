import { coords } from "../types/gameplay";
import { play } from "../types";

export default abstract class GameObject {
  protected SendAction: void;
  protected OnCreate: void;
  protected OnDestroy: void;

  public rect: play.rect;
  public RoomAction: void;
  public owner: string;
  public class: string;

  constructor (_owner : string, _coords: play.coords, _sprite: play.sprite, _class: string) {
     this.owner = _owner;
     this.rect = {
      ..._coords,
      ..._sprite
     }
     this.class = _class

  }

  public center () : coords {
    return {
      x: this.rect.x + (this.rect.width / 2),
      y: this.rect.y + (this.rect.height / 2)
    }
  }
}
