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
  private listIndex: number = 0;
  private isOnStarPosition: boolean = false;
  private lastTargetId: string = ''
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
    try {
      const stars = this.manager
      .getObjectsByClassName(classes.star)
      .filter((star) => {
        return star.owner !== this.owner;
      });
    } catch (e) {
      this.room.SendLog('error', e.message);
    }

    /*
    if (stars.length > 0) {
      this.TargetStar = stars[0];
      const positions = this.TargetStar.GetAllPositions()
      this.TargetStar.HoldPosition(positions[this.listIndex].center);
      this.targetPosition = positions[this.listIndex].center;
    } */
    this.room.SendLog('ship activated', _listIndex);
    // this.StartMove();
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
      this.speed = 0;
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
   /*
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
  } */
  /*
  public StartAttacking(target: Ship | BattlesShip) {
    this.room.SendLog('Attacking', this.center, target.center, this.manager.calcRange(this.center, target.center));
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
    }, defShipFireDelay)
  } */

  private SearchTargetByPosition = (_id = this.id, coords = this.center) => {
    if (!this.targetPosition) {
      this.targetPosition = this.GetClosestPosition(
        this.center,
        this.TargetStar,
      );
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
        // this.TargetStar.HoldPosition(defTarget);
        this.isOnStarPosition = true;
        this.MoveStop(defTarget, true);
      }
      return () => {};
    }
    try {
      const Targets = this.manager.getClosestObjects(_id, [
        classes.ship,
        classes.battleship,
      ]);
      if (Targets.length > 0) {
        const trg = this.manager.getObjectById(Targets[0]);
        const range = this.manager.calcRange(coords, trg.center);
        if (range <= this.attackRange) {
          this.MoveStop(this.center, true /* this.inMoving ? true : false */);
          this.AttackObject(trg);
          this.attackTimeout = setInterval(() => {
            const trg = this.manager.getObjectById(Targets[0]);
            if (trg) {
              this.AttackObject(trg);
            } else {
              clearInterval(this.attackTimeout);
              this.SearchTargetByPosition();
            }
          }, defShipFireDelay)
        } else {
          this.MoveTo(trg.center, Math.round(shipMovingTime * (range / 350)), this.SearchTargetByPosition);
        } 
      } else {
        try {
          this.MoveTo(this.defTarget, shipMovingTime, this.SearchTargetByPosition);
        } catch (e) {
          this.room.SendLog('error', e.message); 
        }
      }
    } catch (e) {
      this.room.SendLog('error', e.message);     
    }

    return () => {};
  };

  public StartMove() {
    this.defTarget = this.GetClosestPosition(this.center, this.TargetStar);
    this.TargetStar?.HoldPosition(this.defTarget);
    const rangeToDefTarget = this.manager.calcRange(this.center, this.defTarget);
    const testMsg = {
      action: actionList.log,
      id: this.id,
      targetPos: this.defTarget,
      range: rangeToDefTarget,
    };
    this.room.ReSendMessage(JSON.stringify(testMsg));
    if (rangeToDefTarget < 5) {
      if (!this.isOnStarPosition) {
        this.AttackStar();
        this.TargetStar.HoldPosition(this.defTarget);
        this.isOnStarPosition = true;
        this.MoveStop(this.defTarget, true);
      }
      return;
    }

    this.MoveTo(this.defTarget, shipMovingTime, this.SearchTargetByPosition);

  }

  protected onDestroy() {
    clearInterval(this.timer);
    clearInterval(this.attackTimeout);
    try {
      const isUnhold = this.TargetStar?.UnHoldPosition(this.center);
      this.room.SendLog('UnHolded', isUnhold);
    }  catch (e) {
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
