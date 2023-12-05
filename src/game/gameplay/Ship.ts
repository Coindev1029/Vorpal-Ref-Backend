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
  shipSpeed,
} from '../config';
import { GameRoom } from '../core/Room';
import ObjectListManager from '../core/ListManager';
import { WriteLog } from '../../database/log';
import { actionList, classes } from '../types/msg';
import { coords, rect } from '../types/gameplay';
import Star from './Star';
import { MoveFunction } from '../types/interfaces';
import { BattlesShip } from './BattleShip';

export class Ship extends GameObject {
  private timer: NodeJS.Timer;
  private attackTimeout: NodeJS.Timer;
  private hp: number;
  private dir: boolean = true; // true - up, false - down
  private hitChance: number = defShipHitChance;
  private TargetStar: Star;
  private attackRange: number;
  private listIndex: number = -1;
  private isOnStarPosition: boolean = false;
  private lastTargetId: string = '';
  private defTarget: coords;

  public isAttacking: boolean = false;
  public targetPosition: coords;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _radius: number,
    _manager: ObjectListManager<any>,
    dir: boolean,
  ) {
    super(_room, _owner, _coords, _radius, classes.ship, _manager);
    this.dir = dir;
    this.attackRange = shipRange;
    this.onCreate();
    this.speed = shipSpeed;
  }

  public Activate(_listIndex?: number) {
    if (_listIndex) this.listIndex = _listIndex;
    const stars = this.manager
      .getObjectsByClassName(classes.star)
      .filter((star) => {
        return star.owner !== this.owner;
      });

    if (stars.length > 0) {
      this.TargetStar = stars[0];
      if (this.listIndex < 0) {
        const position = this.GetClosestPosition(
          this.center,
          this.TargetStar,
          false,
        );
        this.TargetStar.HoldPosition(position);
        this.targetPosition = position;
        this.isActive = true;
        return;
      }
      const positions = this.TargetStar.GetAllPositions();
      this.TargetStar.HoldPosition(positions[this.listIndex].center);
      this.targetPosition = positions[this.listIndex].center;
      this.isActive = true;
    }
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

  public GetClosestPosition(point?: coords, star?: Star, free = false): coords {
    if (!star || !point) {
      return this.ReservePosition();
    }
    const positions = free
      ? star.GetAllPositions()
      : star.GetFreePositions().sort((a, b) => {
          const rangeA = this.manager.calcRange(point, a.center);
          const rangeB = this.manager.calcRange(point, b.center);
          if (rangeA < rangeB) return -1;
          if (rangeA > rangeB) return 1;
          return 0;
        });
    if (positions.length === 0) {
      return this.ReservePosition();
    }

    const logMsg = {
      action: actionList.log,
      ...positions,
    };
    this.room.ReSendMessage(JSON.stringify(logMsg));

    if (free) {
      return positions[0].center;
    }

    return this.listIndex >= 0 && positions[this.listIndex].hold === false
      ? positions[this.listIndex].center
      : this.ReservePosition();
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
      this.room.ReSendMessage(
        JSON.stringify({
          action: actionList.event,
          type: 'attack',
          result: 'hit',
          damage: damage,
        }),
      );
    } else {
      this.room.ReSendMessage(
        JSON.stringify({
          action: actionList.event,
          type: 'attack',
          result: 'miss',
          damage: damage,
        }),
      );
    }
    const msg = {
      action: actionList.objectupdate,
      data: {
        from: this.id,
        to: target.getId(),
        damage: damage,
        hit: isHit,
      },
    };
    this.room.ReSendMessage(JSON.stringify(msg));
  }

  public FindTarget() {
    const Targets = this.manager.getClosestObjects(this.id, [
      classes.ship,
      classes.battleship,
    ]);
    if (Targets.length === 0) {
      return false;
    }
    const trg = this.manager.getObjectById(Targets[0]);
    return trg;
  }

  public StartAttacking(target: Ship | BattlesShip) {
    this.room.SendLog(
      'Attacking',
      this.center,
      target.center,
      this.manager.calcRange(this.center, target.center),
    );
    this.isAttacking = true;
    this.speed = 0;
    this.attackTimeout = setInterval(() => {
      const trg = this.manager.getObjectById(target.getId());
      if (trg) {
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
      const isUnhold = this.TargetStar?.UnHoldPosition(this.center);
      this.room.SendLog('UnHolded', isUnhold);
    } catch (e) {
      this.room.SendLog('error', e.message);
    }
    // clearTimeout(this.attackTimeout);
    const msg = {
      action: actionList.objectdestroy,
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
      this.room.ReSendMessage(
        JSON.stringify({
          action: actionList.objectupdate,
          id: this.id,
          hp: this.hp,
        }),
      );
    }
  }

  public getHp() {
    return this.hp;
  }

  public destroy = () => {
    this.onDestroy();
  };
}
