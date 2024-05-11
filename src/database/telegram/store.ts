const { connection } = require('../connection');

export async function AddStoreItem () {
    const query = `INSERT INTO "store_items" ("item_name",
    "item_type",
    "item_img",
    price integer,
    currency varchar(128))`
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