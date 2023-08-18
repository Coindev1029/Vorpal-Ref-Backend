import { play } from "../types";

export default abstract class GameObject {
  private SendAction: void;

  public rect: play.rect;
  public OnCreate: void;
  public OnDestroy: void;
  public RoomAction: void;
  public owner: string;

  constructor (_owner : string, _coords: play.coords, _sprite: play.sprite) {
     this.owner = _owner;
     this.rect = {
      ..._coords,
      ..._sprite
     }

  }
}
