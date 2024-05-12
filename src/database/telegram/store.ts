import { storeItem } from "../../types";

const { connection } = require('../connection');

export async function AddStoreItem (item: storeItem) {
    const query = `INSERT INTO "store_items" ("item_name",
    "item_type",
    "item_img",
    "price",
    "currency") VALUES ('${item.item_name}', '${item.item_type || ""}', 
    '${item.item_img  || ""}',
    ${item.price || 0}, 
    '${item.currency || "vrp"}');`
}

export async function GetStoreItems () {
    const query = ``
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

export async function GetUserItemBalance () {

}

export async function BuyItem () {

}