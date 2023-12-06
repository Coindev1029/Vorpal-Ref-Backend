import { play } from '../types';
import ObjectListManager from '../core/ListManager';
import { GameRoom } from '../core/Room';
import GameObject from './GameObject';
import { bShipSpeed, defBattleShipHealth } from '../config';
import Star from './Star';
import { Classes, PackTitle } from '../types/Messages';
import { coords } from '../types/gameplay';

export class BattlesShip extends GameObject {
  private timer: NodeJS.Timer;
  private hp: number;
  public targetPosition: coords = {x: 0, y: 0};
  public isAttacking: boolean = false;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _radius: number,
    _manager: ObjectListManager<any>,
  ) {
    super(_room, _owner, _coords, _radius, Classes.battleship, _manager);
    this.manager = _manager;
    this.speed = bShipSpeed;
    this.onCreate();
  }

  private onCreate() {
    this.hp = defBattleShipHealth;
    this.room.SendLog("BattleShip created", "10s");
    
    const stars = this.manager.getObjectsByClassName(Classes.star).filter((st: Star) => {
      return st.owner !== this.owner;
    });
    if (stars.length > 0) {
      this.targetPosition = stars[0].BSPosition;
    }
  }

  private onDestroy() {
    const msg = {
      action: PackTitle.objectdestroy,
      data: {
        id: this.id,
      },
    };
    clearInterval(this.timer);
    this.room.ReSendMessage(JSON.stringify(msg));
    this.manager.removeObject(this.id);
  }

  public Activate() {
    this.isActive = true;
  }

  public AttackState() {
    this.isAttacking = true;
  }

  public TakeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.destroy();
    } else {
      this.room.ReSendMessage(JSON.stringify({
        action: PackTitle.objectupdate,
        id: this.id,
        hp: this.hp
      }))
    }
  }

  public destroy = () => {
    this.onDestroy();
  };
}
