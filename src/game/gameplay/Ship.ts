import GameObject from './GameObject';
import { play } from '../types';
import {
  defCoords,
  defShipDamage,
  defShipFireDelay,
  defShipHealth,
  defShipHitChance,
  moveFrame,
  shipMovingTime,
} from '../config';
import { GameRoom } from '../core/Room';
import ObjectListManager from '../core/ListManager';
import { WriteLog } from '../../database/log';
import { actionList, classes } from '../types/msg';
import { coords, rect } from '../types/gameplay';
import Star from './Star';

export class Ship extends GameObject {
  private timer: NodeJS.Timer;
  private hp: number;
  private dir: boolean = true; // true - up, false - down
  private hitChance: number = defShipHitChance;
  private manager: ObjectListManager<any>;
  private TargetStar: Star;

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
    this.onCreate();
  }

  private SearchTarget() {
    const ships = this.manager.getObjectsByClassName(classes.ship);
    const enemies = ships.filter((sh) => {
      return sh.owner !== this.owner;
    });
    const coords = this.center;
    const targets = enemies.sort((a, b) => {
      const itemCoordsA = a.center;
      const itemCoordsB = b.center;
      const distanceA =
        (coords.x - itemCoordsA.x) ** 2 + (coords.y - itemCoordsA.y) ** 2;
      const distanceB =
        (coords.x - itemCoordsB.x) ** 2 + (coords.y - itemCoordsB.y) ** 2;
      if (distanceA === distanceB) return 0;
      return distanceA < distanceB ? -1 : 1;
    });
    // Test :
    /* const sortedTgs = targets;
    const dists: number[] = [];
    sortedTgs.forEach((tg) => {
      const itemCoords = tg.center();
      const distance =
        (coords.x - itemCoords.x) ** 2 + (coords.y - itemCoords.y) ** 2;
      dists.push(distance);
    });
    WriteLog(
      'Calculated : ',
      `this : ${JSON.stringify(coords)}, enemies: ${JSON.stringify(dists)}`,
    ); */
    // End test
    if (targets.length > 0) {
      return targets[0];
    } else {
      return null;
    }
  }

  public Activate() {
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

  private AttackStar() {
    const targets = this.manager
      .getObjectsByClassName(classes.star)
      .filter((star) => {
        return star.owner !== this.owner;
      });
    if (targets.length > 0) {
      const trg = targets[0];

      this.center.x += trg.center.x;
      this.center.y += trg.center.y + 120 * (this.dir ? -1 : 1);

      const msg = {
        action: actionList.objectupdate,
        data: {
          id: trg.id,
          damage: this.hp,
          wasHP: trg.energy,
          hit: true,
        },
      };
      this.room.ReSendMessage(JSON.stringify(msg));
      trg.TakeDamage(this.hp);
      this.hp = 0;
      this.destroy();
    }
  }

  private AttackBattleShip() {
    const targets = this.manager
      .getObjectsByClassName(classes.battleship)
      .filter((star) => {
        return star.owner !== this.owner;
      });
    if (targets.length > 0) {
      const trg = targets[0];

      this.center.x += trg.rect.x;
      this.center.y += trg.rect.y + 60 * (this.dir ? -1 : 1);
      const aiming = Math.random();
      const isHit = aiming < this.hitChance;

      if (isHit) {
        const damage =
          defShipDamage[0] +
          Math.round((defShipDamage[1] - defShipDamage[0]) * Math.random());
        trg.TakeDamage(damage);
        this.room.ReSendMessage(JSON.stringify({
          action: actionList.event,
          type: 'attack',
          result: 'hit',
          damage: damage
        }))
      } else {
        const damage =
          defShipDamage[0] +
          Math.round((defShipDamage[1] - defShipDamage[0]) * Math.random());
          this.room.ReSendMessage(JSON.stringify({
            action: actionList.event,
            type: 'attack',
            result: 'miss',
            damage: damage
          }))
      }

      setTimeout(() => {
        this.AttackBattleShip();
      }, defShipFireDelay);
    } else {
      this.AttackStar();
    }
  }

  private AttackShip() {
    const target = this.SearchTarget();
    const aiming = Math.random();
    const isHit = aiming < this.hitChance;
    if (target === null) {
      return this.AttackBattleShip();
    }
    const damage =
    defShipDamage[0] +
    Math.round((defShipDamage[1] - defShipDamage[0]) * Math.random());
    if (isHit) {
      target.TakeDamage(damage);
      this.room.ReSendMessage(JSON.stringify({
        action: actionList.event,
        type: 'attack',
        result: 'hit',
        damage: damage
      }))
    } else {
        this.room.ReSendMessage(JSON.stringify({
          action: actionList.event,
          type: 'attack',
          result: 'miss',
          damage: damage
        }))
    }
    const msg = {
      action: actionList.objectupdate,
      data: {
        from: this.id,
        to: target.id,
        wasHP: target.getHp(),
        damage: damage,
        hit: isHit,
      },
    };
    this.room.ReSendMessage(JSON.stringify(msg));
  }

  protected onCreate() {
    this.hp = defShipHealth;
  }
  
  public StartMove() {
    this.MoveTo({x: this.center.x, y: defCoords.battleLine + 50 * (this.dir ? -1 : 1)}, shipMovingTime);
    setTimeout(() => {
      this.center.y = defCoords.battleLine + 50 * (this.dir ? -1 : 1);
      this.timer = setInterval(() => {
        this.AttackShip();
      }, defShipFireDelay);
    }, shipMovingTime);
    // this.hp = defShipHealth;
  }

  protected onDestroy() {
    clearInterval(this.timer);
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
      this.room.ReSendMessage(JSON.stringify({
        action: actionList.objectupdate,
        id: this.id,
        hp: this.hp
      }))
    }
  }

  public getHp() {
    return this.hp;
  }

  public destroy = () => {
    this.onDestroy();
  };
}
