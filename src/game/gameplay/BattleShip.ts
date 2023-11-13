import { play } from '../types';
import ObjectListManager from '../core/ListManager';
import { GameRoom } from '../core/Room';
import { actionList } from '../types/msg';
import GameObject from './GameObject';
import { defBattleShipHealth } from '../config';
import Star from './Star';

export class BattlesShip extends GameObject {
  private timer: NodeJS.Timer;
  private hp: number;
  private manager: ObjectListManager<any>;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _sprite: play.sprite,
    _manager: ObjectListManager<any>,
  ) {
    super(_room, _owner, _coords, _sprite, 'battleship');
    this.manager = _manager;
    this.onCreate();
  }

  private onCreate() {
    this.hp = defBattleShipHealth;
    setTimeout(() => {
      const stars = this.manager.getObjectsByClassName('star').filter((st) => {
        return st.owner !== this.owner;
      });
      if (stars.length > 0) {
        const trg: Star = stars[0];
        this.rect.x = trg.rect.x + trg.rect.width;
        this.rect.y = trg.rect.y + trg.rect.height;
        const msg = {
          action: actionList.objectupdate,
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
      action: actionList.objectdestroy,
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
        action: actionList.objectupdate,
        id: this.id,
        hp: this.hp
      }))
    }
  }

  public destroy = () => {
    this.onDestroy();
  };
}
