import { play } from '../types';
import ObjectListManager from '../core/ListManager';
import { GameRoom } from '../core/Room';
import GameObject from './GameObject';
import { defBattleShipHealth } from '../config';
import Star from './Star';
import { Classes, PackTitle } from '../types/Messages';

export class BattlesShip extends GameObject {
  private timer: NodeJS.Timer;
  private hp: number;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _radius: number,
    _manager: ObjectListManager<any>,
  ) {
    super(_room, _owner, _coords, _radius, Classes.battleship, _manager);
    this.manager = _manager;
    this.onCreate();
  }

  private onCreate() {
    this.hp = defBattleShipHealth;
    this.room.SendLog("BattleShip created", "10s");
    setTimeout(() => {
      const stars = this.manager.getObjectsByClassName('star').filter((st) => {
        return st.owner !== this.owner;
      });
      if (stars.length > 0) {
        const trg: Star = stars[0];
        this.center.x = trg.center.x + (trg.radius * 2);
        this.center.y = trg.center.y + (trg.radius * 2);
        const msg = {
          action: PackTitle.objectupdate,
          data: {
            from: this.id,
            starOwner: trg.owner,
            wasHP: trg.energy,
            periodic: 1,
            state: 'started'
          },
        };
        this.room.ReSendMessage(JSON.stringify(msg))
        this.timer = setInterval(() => {
          this.AttackStar();
        }, 1000);
      }
    }, 10000);
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

  private DetectTarget(): Star | null {
    const stars = this.manager.getObjectsByClassName('star');
    stars.forEach((st) => {
      if (st.owner !== this.owner) {
        return st;
      }
    });
    return null;
  }

  private AttackStar() {
    const target: Star | null = this.DetectTarget();
    if (target) {
      target.TakeDamage(1);
    }
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
