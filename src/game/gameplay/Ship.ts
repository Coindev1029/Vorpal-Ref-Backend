import GameObject from './GameObject';
import { play } from '../types';
import { defCoords, defShipHealth, shipMovingTime } from '../config';
import { GameRoom } from '../core/Room';
import ObjectListManager from 'game/core/ListManager';

export class Ship extends GameObject {
  private timer: NodeJS.Timer;
  private hp: number;
  private dir: boolean = true; // true - up, false - down
  private manager: ObjectListManager<any>;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _sprite: play.sprite,
    _manager: ObjectListManager<any>,
    dir: boolean,
  ) {
    super(_room, _owner, _coords, _sprite, 'ship');
    this.dir = dir;
    this.manager = _manager;
    this.onCreate();
  }

  private SearchTarget() {
       const ships = this.manager.getObjectsByClassName('ship');
       const enemies = ships.filter((sh) => {
          return sh.owner !== this.owner;
       })
       const coords = this.center()
       const targets = enemies.sort((a, b) => {
          const itemCoordsA = a.center()
          const itemCoordsB = b.center()
          const distanceA = ((coords.x - itemCoordsA.x) ** 2) + ((coords.y - itemCoordsA.y) ** 2)
          const distanceB = ((coords.x - itemCoordsB.x) ** 2) + ((coords.y - itemCoordsB.y) ** 2)
          if (distanceA === distanceB) return 0;
          return (distanceA > distanceB) ? -1 : 1
       })
       if (targets.length > 0) {
          return targets[0];
       } else {
         return null;
       }
  }

  protected onCreate() {
     setTimeout(() => {
        this.rect.y = defCoords.battleLine + (50 * (this.dir ? -1 : 1));
     }, shipMovingTime)
     this.hp = defShipHealth;
  }

  protected onDestroy() {
       clearInterval(this.timer)
    }

  public TakeDamage (damage: number) {
     this.hp -= damage;
     if (this.hp <= 0) {
       this.destroy()
     }
  }

  public getHp() {
    return this.hp;
  }
    
  public destroy = () => {
    this.onDestroy()
  }

}