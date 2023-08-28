import GameObject from '../gameplay/GameObject';

export default class ObjectListManager<T extends GameObject> {
  private idLength = 64;
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
    const newId = this.GenerateId(this.idLength);
    object.assignId(newId);
    newObjects.set(newId, object);
    this.objectList = newObjects;
    return newId;
  }

  removeObject(id: string): T[] {
    if (!this.objectList.has(id)) {
      return this.getAllObjects();
    }
    const newObjects = new Map(this.objectList);
    newObjects.delete(id);
    this.objectList = newObjects;
    return this.getAllObjects();
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
