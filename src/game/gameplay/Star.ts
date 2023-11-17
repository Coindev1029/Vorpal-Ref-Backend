import { WriteLog } from '../../database/log';
import GameObject from './GameObject';
import { play } from '../types';
import { GameRoom } from '../core/Room';
import { defCoords, defShipHealth, defStarHealth } from '../config';
import { actionList, classes } from '../types/msg';
import { StarAttackPosition, coords } from '../types/gameplay';

export default class Star extends GameObject {
  public energy: number;
  public AttackPositions: StarAttackPosition[] = [];
  private lifeTimer: NodeJS.Timer;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _radius: number,
  ) {
    super(_room, _owner, _coords, _radius, classes.star);
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
      action: actionList.objectupdate,
      id: this.id,
      owner: this.owner,
      data: {
        event: 'starAttackPositions',
        list: this.AttackPositions
      }
    }))
  }

  protected onCreate() {
    // WriteLog(this.owner, 'Star placed');
    this.energy = defStarHealth;
    this.FillAttackPositions();
    this.lifeTimer = setInterval(() => {
      this.TakeDamage(1);
    }, 1000);
  }

  protected onDestroy() {
    clearInterval(this.lifeTimer);
    this.room.StarDestroy(this.owner, this.id);
  }

  public TakeDamage(damage: number) {
    this.energy -= damage;
    if (this.energy <= 0) {
      this.destroy();
    } else {
      this.room.ReSendMessage(
        JSON.stringify({
          action: actionList.objectupdate,
          id: this.id,
          enegry: this.energy,
        }),
      );
    }
  }

  public destroy = () => {
    this.onDestroy();
  };
}
