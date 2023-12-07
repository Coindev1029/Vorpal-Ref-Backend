import { play } from '../types';
import ObjectListManager from '../core/ListManager';
import { GameRoom } from '../core/Room';
import GameObject from './GameObject';
import { bShipSpeed, defBattleShipDamage, defBattleShipHealth, defShipFireDelay, defShipHitChance, shipRange } from '../config';
import Star from './Star';
import { Classes, PackTitle } from '../types/Messages';
import { coords } from '../types/gameplay';
import { PackFactory } from '../utils/PackFactory';
import { Ship } from './Ship';

export class BattlesShip extends GameObject {
  private timer: NodeJS.Timer;
  private hp: number;
  private targetStar: Star;
  public targetPosition: coords = {x: 0, y: 0};
  public isAttacking: boolean = false;
  private hitChance: number = defShipHitChance;

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
      this.targetStar = stars[0];
    }
  }

  private onDestroy() {
    const msg = {
      action: PackTitle.objectdestroy,
      id: this.id,
    };
    clearInterval(this.timer);
    this.room.ReSendMessage(JSON.stringify(msg));
    this.manager.removeObject(this.id);
  }

  private AttackStar() {
    this.speed = 0;
    this.targetStar.TakeDamage(1);
  }

  private AttackShip(target: Ship) {
    const aiming = Math.random();
    const isHit = aiming < this.hitChance;
    const damage =
      defBattleShipDamage[0] +
      Math.round((defBattleShipDamage[1] - defBattleShipDamage[0]) * Math.random());
    if (isHit) {
      target.TakeDamage(damage);
    } 

    this.room.ReSendMessage(PackFactory.getInstance().attackLaser({
      idFrom: this.id,
      idTo: target.getId(),
      damage: damage,
      isMiss: !isHit
    }));
  }

  public Activate() {
    this.isActive = true;
  }

  public AttackState() {
    this.isAttacking = true;
    this.room.ReSendMessage(PackFactory.getInstance().attackRay({
      idFrom: this.id,
      idTo: this.targetStar.getId(),
      state: 'start'
    }));
    this.timer = setInterval(() => {
       this.AttackStar();
       const enemyShips = this.manager.getClosestObjects(this.id, [Classes.ship]);
       if (enemyShips.length > 0) {
           const trg = this.manager.getObjectById(enemyShips[0])
           const range = this.manager.calcRange(this.center, trg.center);
           if (range <= shipRange) {
              this.AttackShip(trg);
           }
       }
    }, defShipFireDelay)
  }

  public getHp() {
    return this.hp;
  }

  public TakeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.destroy();
    } else {
      this.room.ReSendMessage(PackFactory.getInstance().objectUpdate([{
        id: this.id,
        hp: this.hp
      }]));
    }
  }

  public destroy = () => {
    this.onDestroy();
  };
}
