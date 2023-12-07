import { Classes, PackTitle } from "../types/Messages";

export class PackFactory {
    private static _instance: PackFactory;

    private constructor() {
        if (PackFactory._instance) throw new Error("Don't use PacketFactory.constructor(), it's SINGLETON, use getInstance() method");
    }

    static getInstance(): PackFactory {
        if (!PackFactory._instance) PackFactory._instance = new PackFactory();
        return PackFactory._instance;
    }

    objectCreate(aList: {

        // common params
        id: string,
        owner: string,
        class: Classes,
        radius?: number,
        position?: { x: number, y: number },
        rotation?: number,
        hp?: number,

        /**
         * special data for planets
         */
        planetData?: {
            orbitRadius?: number,
            orbitCenter?: { x: number, y: number },
            startOrbitAngle?: number,
            year?: number,
            rotationSpeed?: number,
            orbitSpeed?: number,
        }

    }[]): string {
        return JSON.stringify({
            title: PackTitle.objectCreate,
            list: aList
        });
    }

    /**
     * Universal packet for object parameters update
     * @param aList List of objects id and data
     * @returns 
     */
    objectUpdate(aList: {
        id: string,
        event?: string,
        position?: { x: number, y: number },
        rotation?: number,
        hp?: number,
        /**
         * Any other data
         */
        data?: any
    }[]): string {
        return JSON.stringify({
            title: PackTitle.objectUpdate,
            list: aList
        });
    }

    attack(aData: {
        from: string,
        to: string,
        damage: number,
        angle?: number,
        hit: boolean
    }): string {
        return JSON.stringify({
            action: PackTitle.objectUpdate,
            data: aData
        });
    }

}