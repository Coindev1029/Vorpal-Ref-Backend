import { coords } from '../types/gameplay';
import GameObject from '../gameplay/GameObject';

export default class ObjectListManager<T extends GameObject> {
  public objectList: Map<string, T>;

  constructor() {
    this.objectList = new Map();
  }

  public GenerateId(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  addObject(object: T): string {
    const newObjects = new Map(this.objectList);
    const newId = object.getId();
    newObjects.set(newId, object);
    this.objectList = newObjects;
    return newId;
  }

  removeObject(id: string) {
    if (!this.objectList.has(id)) {
      return this.getAllObjects();
    }
    const newObjects = new Map(this.objectList);
    newObjects.delete(id);
    this.objectList = newObjects;
  }

  calcRange(point1: coords, point2: coords) {
    return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
  }

  calcRangeByIds(id1: string, id2: string) {
    const ob1 = this.getObjectById(id1);
    const ob2 = this.getObjectById(id2);
    const point1 = ob1?.center;
    const point2 = ob2?.center;
    if (point1 && point2) {
      return this.calcRange(point1, point2);
    } else {
      return 0;
    }
  }

  getCollisions(_id: string, classes: string[] | 'all' = 'all'): string[] {
    const ob = this.getObjectById(_id);
    const result: string[] = [];
    if (!ob) {
      return result;
    }
    let list = this.getAllObjects().filter((obj) => {
      return obj.getId() !== _id;
    });
    if (classes !== 'all') {
      list = list.filter((obj) => {
        return classes.indexOf(obj.class) > -1 ? true : false;
      });
    }
    list.forEach((item) => {
      const r = item.radius;
      const range = this.calcRange(ob.center, item.center);
      if (range <= item.radius + ob.radius) {
        result.push(item.getId());
      }
    });
    return result;
  }

  getClosestObjects(
    _id: string,
    classes: string[] | 'all' = 'all',
    enemy = true,
    range: number = 9999,
  ): string[] {
    const result: string[] = [];
    const ob = this.getObjectById(_id);
    if (!ob) {
      return result;
    }
    let list = this.getAllObjects().filter((obj) => {
      return obj.getId() !== _id && (enemy ? ob.owner !== obj.owner : true);
    });
    if (classes !== 'all') {
      list = list.filter((obj) => {
        return classes.indexOf(obj.class) > -1 ? true : false;
      });
    }
    list = list.filter((obj) => {
      const dist = this.calcRange(obj.center, ob.center);
      return range >= dist;
    });
    list.sort((a, b) => {
      const distA = this.calcRange(a.center, ob.center);
      const distB = this.calcRange(b.center, ob.center);
      if (distA < distB) return -1;
      if (distA === distB) return 0;
      return 1;
    });
    list.forEach((item) => {
      result.push(item.getId());
    });
    return result;
  }

  getObjectById(id: string): T | undefined {
    return this.objectList.get(id);
  }

  getObjectsByClassName(className: string): T[] {
    return Array.from(this.objectList.values()).filter((value) => {
      return value.class === className;
    });
  }

  getObjectsByOwner(owner: string): T[] {
    return Array.from(this.objectList.values()).filter((value) => {
      return value.owner === owner;
    });
  }

  getObjectsByParam(param: string, val: string): T[] {
    return Array.from(this.objectList.values()).filter((value) => {
      return value[param] === val;
    });
  }

  getAllObjects(): T[] {
    return Array.from(this.objectList.values());
  }
}
