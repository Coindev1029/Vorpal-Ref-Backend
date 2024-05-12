import { TelegramAuthData, storeItem } from "../../types";

const { connection } = require('../connection');

export async function AddStoreItem (item: storeItem) {
    const query = `INSERT INTO "store_items" ("item_name",
    "item_type",
    "item_img",
    "price",
    "currency") VALUES ('${item.item_name}', '${item.item_type || ""}', 
    '${item.item_img  || ""}',
    ${item.price || 0}, 
    '${item.currency || "vrp"}');`;
    try {
        await connection.query(query);
        return true;
    } catch (e) {
        console.log("Error: ", e.message);
        return false;
    }
}

export async function GetStoreItems (): Promise<storeItem[]> {
    const query = `SELECT "item_name", "item_type", "item_img", "price" FROM "store_items";`;
    try {
        const result = await connection.query(query);
        return result.rows;
    } catch (e) {
        console.log("Error: ", e.message);
        return [];
    }
}

export async function GetStoreItem (param: string, value: string | number): Promise<storeItem | null> {
    const query = `SELECT "item_name", "item_type", "item_img", "price" FROM "store_items" WHERE "${param}" = ${value};`;
    try {
        const result = await connection.query(query);
        return result.rows.length > 0 ? result.rows : null;
    } catch (e) {
        console.log("Error: ", e.message);
        return null;
    }
}

export async function AddUniqueItem () {
    const query = ``
}

export async function GetUniqueItemsForSale () {
    const query = ``
}

export async function GetUniqueItemsByOwner () {
    const query = ``
}

export async function GetUserItemBalance (login: string, item: string) {
   
}

export async function BuyItem (itemName: string, amount: number) {
}