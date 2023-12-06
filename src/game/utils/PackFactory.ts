import { Classes, PackTitle } from "game/types/msg";

export class PackFactory {
    private static _instance: PackFactory;

    private constructor() {
        if (PackFactory._instance) throw new Error("Don't use PacketFactory.constructor(), it's SINGLETON, use getInstance() method");
    }

    static getInstance(): PackFactory {
        if (!PackFactory._instance) PackFactory._instance = new PackFactory();
        return PackFactory._instance;
    }

    attack(aData: {
        from: string,
        to: string,
        damage: number,
        hit: boolean
    }): string {
        return JSON.stringify({
            action: PackTitle.objectupdate,
            data: aData
        });
    }

    updateShipList(aList: any[]) {
        return JSON.stringify({
            action: PackTitle.objectupdate,
            class: Classes.ship,
            data: {
                list: aList
            }
        })
    }

    updateObject(aData: {
        id: string,
        hp: number
    }) {
        return JSON.stringify({
            action: PackTitle.objectupdate,
            id: aData.id,
            hp: aData.hp
        })
    }

}