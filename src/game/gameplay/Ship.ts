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
  private attackTimeout: NodeJS.Timeout;
  private hp: number;
  private dir: boolean = true; // true - up, false - down
  private hitChance: number = defShipHitChance;
  private manager: ObjectListManager<any>;
  private TargetStar: Star;
  private attackRange: number;
  private isAttacking: boolean = false;
  private targetPosition: coords;
  private listIndex: number = 0;
  private isOnStarPosition: boolean = false;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _radius: number,
    _manager: ObjectListManager<any>,
    dir: boolean,
  ) {
    super(_room, _owner, _coords, _radius, classes.ship);
    this.dir = dir;
    this.manager = _manager;
    this.attackRange = shipRange;
    this.onCreate();
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
    }
    this.StartMove();
  }

  private AttackStar(_id = this.id, coords = this.center) {
    const logMsg = {
      action: actionList.log,
      event: 'findStar',
    };
    this.room.ReSendMessage(JSON.stringify(logMsg));
    const trg = this.TargetStar;
    if (trg) {
      const msg = {
        action: actionList.log,
        data: {
          event: 'attackStar',
          starId: trg.getId(),
          willDamage: this.hp,
          starEnergy: trg.energy,
        },
      };
      this.room.ReSendMessage(JSON.stringify(msg));
      this.isAttacking = true;
      this.isOnStarPosition = true;
      this.timer = setInterval(() => {
        trg.TakeDamage(1);
        this.TakeDamage(1);
        const logMsg = {
          action: actionList.log,
          event: 'starDamage',
          nowHP: this.hp,
        };
        this.room.ReSendMessage(JSON.stringify(logMsg));
      }, FrameInterval);
    }
    return () => {};
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

  public GetClosestPosition(point?: coords, star?: Star): coords {
    if (!star || !point) {
      return this.ReservePosition();
    }
    const positions = star.GetAllPositions();
    /* const positions =  star.GetFreePositions().sort((a, b) => {
        const rangeA = this.manager.calcRange(point, a.center);
        const rangeB = this.manager.calcRange(point, b.center);
        if (rangeA < rangeB) return -1;
        if (rangeA > rangeB) return 1;
        return 0;
    }) */
    if (positions.length <= this.listIndex) {
      return this.ReservePosition();
    }

    const logMsg = {
      action: actionList.log,
      ...positions,
    };
    this.room.ReSendMessage(JSON.stringify(logMsg));
    return positions[this.listIndex].hold === false
      ? positions[this.listIndex].center
      : this.ReservePosition();
  }

  private AttackObject(target: Ship | BattlesShip) {
    this.isAttacking = true;
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

  private SearchTargetByPosition = (_id = this.id, coords = this.center) => {
    if (!this.targetPosition) {
      this.targetPosition = this.GetClosestPosition(this.center, this.TargetStar);
    }
    const defTarget = this.targetPosition;
    const rangeToDefTarget = this.manager.calcRange(
      { x: coords.x, y: coords.y },
      defTarget,
    );
    this.room.ReSendMessage(JSON.stringify({ rangeTo: rangeToDefTarget }));
    if (rangeToDefTarget < 5) {
      if (!this.isOnStarPosition) { 
        this.AttackStar();
        this.TargetStar.HoldPosition(defTarget);
        this.isOnStarPosition = true;
        this.MoveStop(defTarget, true);
      }
      return () => {}
    }
    
    /* 
    const messageLog = {
      action: actionList.log,
    }
    this.room.ReSendMessage(JSON.stringify(listMsg)); */
    /* if (rangeToDefTarget < 5) {
      if (!this.isOnStarPosition) { 
        this.AttackStar();
        this.TargetStar.HoldPosition(defTarget);
        this.isOnStarPosition = true;
        this.MoveStop(defTarget, true);
      }
      return () => {}
    } */

    /* const Targets = this.manager.getClosestObjects(_id, [classes.ship, classes.battleship]);
     if (Targets.length > 0) {
      const trg = this.manager.getObjectById(Targets[0])
      const range = this.manager.calcRange(coords, trg.center)
      const listMsg = {
        action: actionList.log,
        event: 'SelectingTarget',
        targetRange: range,
        targetClass: trg.class
      }
      this.room.ReSendMessage(JSON.stringify(listMsg));
       if (range <= this.attackRange) {
        this.MoveStop(this.center, this.inMoving ? true : false);
        this.AttackObject(trg);
        this.attackTimeout = setTimeout(() => {
          this.SearchTargetByPosition();
        }, defShipFireDelay)
      } else {
        this.MoveTo(this.center, Math.round(shipMovingTime * (range / 700)), this.SearchTargetByPosition());
      } 
     } else {
       this.StartMove();
     } */
    return () => {};
  };

  public StartMove() {
    const defTarget = this.GetClosestPosition(this.center, this.TargetStar);
    const rangeToDefTarget = this.manager.calcRange(this.center, defTarget);
    const testMsg = {
      action: actionList.log,
      id: this.id,
      targetPos: defTarget,
      range: rangeToDefTarget,
    };
    this.room.ReSendMessage(JSON.stringify(testMsg));
    if (rangeToDefTarget < 5) {
      if (!this.isOnStarPosition) {
        this.AttackStar();
        this.TargetStar.HoldPosition(defTarget);
        this.isOnStarPosition = true;
        this.MoveStop(defTarget, true);
      }
      return;
    }
    // x: this.center.x, y: defCoords.battleLine + 50 * (this.dir ? -1 : 1)}
    //this.MoveTo(defTarget, shipMovingTime, () => {}, this.AttackStar());
    this.MoveTo(defTarget, shipMovingTime, this.SearchTargetByPosition);
    /* setTimeout(() => {
      this.center.y = defCoords.battleLine + 50 * (this.dir ? -1 : 1);
      this.timer = setInterval(() => {
        this.AttackShip();
      }, defShipFireDelay);
    }, shipMovingTime); */
    // this.hp = defShipHealth;
  }

  protected onDestroy() {
    clearInterval(this.timer);
    clearTimeout(this.attackTimeout);
    this.TargetStar?.UnHoldPosition(this.center);
    const msg = {
      action: actionList.objectdestroy,
      data: {
        id: this.id,
      },
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
