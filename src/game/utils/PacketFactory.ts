import { PacketTitle } from "game/types/msg";

export class PacketFactory {
    private static _instance: PacketFactory;

    private constructor() {
        if (PacketFactory._instance) throw new Error("Don't use PacketFactory.constructor(), it's SINGLETON, use getInstance() method");
    }

    static getInstance(): PacketFactory {
        if (!PacketFactory._instance) PacketFactory._instance = new PacketFactory();
        return PacketFactory._instance;
    }

    objectUpdate(aData: {
        from: string,
        to: string,
        damage: number,
        hit: boolean
    }): string {
        return JSON.stringify({
            action: PacketTitle.objectupdate,
            data: aData
        });
    }

}