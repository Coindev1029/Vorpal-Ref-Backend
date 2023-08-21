import GameObject from '../gameplay/GameObject';

export default class ObjectListManager<T extends GameObject> {
      private idLength = 64;
      public objectList :  Map<string, T>;

      constructor() {
        this.objectList = new Map();
      }

      public GenerateId (length : number) : string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
    
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
    
        return result;
      }

    addObject(object: T): string {
        const newObjects = new Map(this.objectList);
        const newId = this.GenerateId (this.idLength);
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

    getObject(id: string): T | undefined {
        return this.objectList.get(id);
    }

    getAllObjects(): T[] {
        return Array.from(this.objectList.values());
    }
}