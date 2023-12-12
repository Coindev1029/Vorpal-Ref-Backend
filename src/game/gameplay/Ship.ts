import GameObject from './GameObject';
import { play } from '../types';
import {
  FrameInterval,
  defCoords,
  defShipDamage,
  defShipFireDelay,
  defShipHealth,
  defShipHitChance,
  moveFrame,
  shipMovingTime,
  shipRange,
  shipRotationSpeed,
  shipSpeed,
} from '../config';
import { GameRoom } from '../core/Room';
import ObjectListManager from '../core/ListManager';
import { coords } from '../types/gameplay';
import Star from './Star';
import { MoveFunction } from '../types/interfaces';
import { BattlesShip } from './BattleShip';
import { Classes, PackTitle } from '../types/Messages';
import { PackFactory } from '../utils/PackFactory';

export class Ship extends GameObject {
  private timer: NodeJS.Timer;
  private attackTimeout: NodeJS.Timer;
  private hp: number;
  private dir: boolean = true; // true - up, false - down
  private hitChance: number = defShipHitChance;
  private attackRange: number;
  private listIndex: number = 0;
  private isOnStarPosition: boolean = false;
  private lastTargetId: string = '';
  private defTarget: coords;

  public isAttacking: boolean = false;
  public targetPosition: coords;
  private TargetStar: Star;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _radius: number,
    _manager: ObjectListManager<any>,
    dir: boolean,
    _angle?: number
  ) {
    super(_room, _owner, _coords, _radius, Classes.ship, _manager, _angle);
    this.dir = dir;
    this.attackRange = shipRange;
    this.onCreate();
    this.speed = shipSpeed;
    this.angleSpeed = shipRotationSpeed;
  }

  public Activate(_listIndex?: number) {
    if (this.isActive) return;
    if (_listIndex) this.listIndex = _listIndex;
    const stars = this.manager
      .getObjectsByClassName(Classes.star)
      .filter((star) => {
        return star.owner !== this.owner;
      });
    if (stars.length > 0) {
      this.TargetStar = stars[0];
      this.targetPosition = this.GetClosestPosition(
        this.center,
        this.TargetStar,
      );
      this.TargetStar.HoldPosition(this.targetPosition);
    } else {
      this.targetPosition = this.ReservePosition();
    }
    this.isActive = true;
  }

  public AttackStar(_id = this.id, coords = this.center) {

    const trg = this.TargetStar;
    this.angle = this.manager.calcAngle(this.center, trg.center);
    if (trg) {

      this.isAttacking = true;
      this.speed = 0;
      this.isOnStarPosition = true;
      this.room.ReSendMessage(PackFactory.getInstance().attackRay({
        idFrom: this.id,
        idTo: trg.getId(),
        state: 'start',
      }));
      this.timer = setInterval(() => {
        trg.TakeDamage(1);
        this.TakeDamage(1);
      }, FrameInterval);
    }
    return this.TargetStar.getId();
  }

  protected onCreate() {
    this.hp = defShipHealth;
  }

  public ReservePosition(): coords {
    return this.dir
      ? {
        x: defCoords.star2.x,
        y: defCoords.star2.y - defCoords.orbDiam,
      }
      : {
        x: defCoords.star1.x,
        y: defCoords.star1.y + defCoords.orbDiam,
      };
  }

  private GetClosestPosition(point?: coords, star?: Star): coords {
    if (!star || !point) {
      return this.ReservePosition();
    }
    // const positions = star.GetAllPositions();
    const positions = star.GetFreePositions().sort((a, b) => {
      const rangeA = this.manager.calcRange(point, a.center);
      const rangeB = this.manager.calcRange(point, b.center);
      if (rangeA < rangeB) return -1;
      if (rangeA > rangeB) return 1;
      return 0;
    });

    if (positions.length === 0) {
      return this.ReservePosition();
    }

    return positions[0].center;
  }

  private AttackObject(target: Ship | BattlesShip) {
    // this.isAttacking = true;
    const aiming = Math.random();
    const isHit = aiming < this.hitChance;
    const damage =
      defShipDamage[0] +
      Math.round((defShipDamage[1] - defShipDamage[0]) * Math.random());
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

  public FindTarget() {
    const Targets = this.manager.getClosestObjects(this.id, [
      Classes.ship,
      Classes.battleship,
    ]);
    if (Targets.length === 0) {
      return false;
    }
    const trg = this.manager.getObjectById(Targets[0]);
    return trg;
  }

  public StartAttacking(target: Ship | BattlesShip) {
    this.isAttacking = true;
    this.speed = 0;
    this.angle = this.manager.calcAngle(this.center, target.center);
    this.attackTimeout = setInterval(() => {
      const trg = this.manager.getObjectById(target.getId());
      if (trg && this.manager.calcRange(this.center, trg.center) <= shipRange) {
        this.AttackObject(trg);
      } else {
        clearInterval(this.attackTimeout);
        this.speed = shipSpeed;
        this.isAttacking = false;
      }
    }, defShipFireDelay);
  }

  protected onDestroy() {
    clearInterval(this.timer);
    clearInterval(this.attackTimeout);
    try {
      const isUnhold =
        this.TargetStar?.UnHoldPosition(this.targetPosition) ||
        this.TargetStar?.UnHoldPosition(this.center);
    } catch (e) {
      this.room.SendLog('error', e.message);
    }
    // clearTimeout(this.attackTimeout);
    const msg = {
      action: PackTitle.objectdestroy,
      id: this.id,
    };
    this.room.ReSendMessage(JSON.stringify(msg));
    this.manager.removeObject(this.id);
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

  public getHp() {
    return this.hp;
  }

  public destroy = () => {
    this.onDestroy();
  };
}
