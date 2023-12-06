import { WriteLog } from '../../database/log';
import GameObject from './GameObject';
import { play } from '../types';
import { GameRoom } from '../core/Room';
import { defCoords, defShipHealth, defStarHealth } from '../config';
import { Classes, PackTitle } from '../types/Messages';
import { StarAttackPosition, coords } from '../types/gameplay';
import ObjectListManager from '../core/ListManager';

export default class Star extends GameObject {
  public energy: number;
  public AttackPositions: StarAttackPosition[] = [];
  private lifeTimer: NodeJS.Timer;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _radius: number,
    _manager: ObjectListManager<any>,
  ) {
    super(_room, _owner, _coords, _radius, Classes.star, _manager);
    this.onCreate();
  }

  protected FillAttackPositions() {
    const atRadius = this.radius + defCoords.sprites.ship.radius + 5;
    const list: StarAttackPosition[] = [];
    for (let j = 0; j < Math.PI * 2; j++) {
      list.push({
        center: {
          x: this.center.x + atRadius * Math.cos(j),
          y: this.center.y + atRadius * Math.sin(j),
        },
        hold: false,
      });
    }
    this.AttackPositions = list;
    this.room.ReSendMessage(JSON.stringify({
      action: PackTitle.objectupdate,
      id: this.id,
      owner: this.owner,
      data: {
        event: 'starAttackPositions',
        list: this.AttackPositions
      }
    }))
  }

  public HoldPosition (point: coords) {
    let result = false;
    this.AttackPositions.forEach((pos) => {
      if (pos.center === point && pos.hold === false) {
          pos.hold = true;
          result = true;
      }
    })
    return result
  }

  public UnHoldPosition (point: coords) {
    let result = false;
    this.AttackPositions.forEach((pos) => {
      if (pos.center === point && pos.hold === true) {
          pos.hold = false;
          result = true;
      }
    })
    return result
  }

  public ResetPositions() {
       this.FillAttackPositions();
  }

  public GetFreePositions () {
    return this.AttackPositions.filter((pos) => {
      return pos.hold === false;
    })
  }

  public GetAllPositions () {
    return this.AttackPositions;
  }

  protected onCreate() {
    // WriteLog(this.owner, 'Star placed');
    this.energy = defStarHealth;
  }

  protected onDestroy() {
    clearInterval(this.lifeTimer);
    this.room.StarDestroy(this.owner, this.id);
  }

  public Activate() {
    this.isActive = true;
    this.FillAttackPositions();
    this.lifeTimer = setInterval(() => {
      this.TakeDamage(1);
    }, 1000);
  }

  public TakeDamage(damage: number) {
    this.energy -= damage;
    if (this.energy <= 0) {
      this.destroy();
    } else {
      this.room.ReSendMessage(
        JSON.stringify({
          action: PackTitle.objectupdate,
          id: this.id,
          class: this.class,
          data: {
            energy: this.energy,
          }
        }),
      );
    }
  }

  public destroy = () => {
    this.onDestroy();
  };
}
