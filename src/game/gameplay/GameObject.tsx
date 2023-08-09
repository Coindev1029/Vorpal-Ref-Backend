export default abstract class GameObject {
  private SendAction: void;

  public OnCreate: void;
  public OnDestroy: void;
  public RoomAction: void;
  public owner: string;
}
