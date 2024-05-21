import { GetUserBalanceRow } from '../../database/rewards';
import { TelegramAuthData, StoreItem, storeItemBalance } from '../../types';

const { connection } = require('../connection');

export async function AddStoreItem(item: StoreItem) {
  const query = `INSERT INTO "store_items" 
    ("item", "type", "rareness", "description", "img_preview", "img_full", "per_user", "total_count", "cost", "currency")
    VALUES ('${item.item}', '${item.type}', '${item.rareness}', 
    '${item.description || ''}', 
    '${item.img_preview || ''}', 
    '${item.img_full || ''}', 
    ${item.per_user}, 
    ${item.total_count}, 
    ${item.cost}, 
    '${item.currency}');`;
  try {
    await connection.query(query);
    return true;
  } catch (e) {
    console.log('Error: ', e.message);
    return false;
  }
}

export async function GetStoreItems(): Promise<StoreItem[]> {
  const query = `SELECT * FROM "store_items";`;
  try {
    const result = await connection.query(query);
    return result.rows;
  } catch (e) {
    console.log('Error: ', e.message);
    return [];
  }
}

export async function GetStoreItem(
  param: string,
  value: string | number,
): Promise<StoreItem | null> {
  const query = `SELECT * FROM "store_items" WHERE "${param}" = ${value};`;
  try {
    const result = await connection.query(query);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (e) {
    console.log('Error: ', e.message);
    return null;
  }
}

export async function AddUniqueItem() {
  const query = ``;
}

export async function GetUniqueItemsForSale() {
  const query = ``;
}

export async function GetUniqueItemsByOwner() {
  const query = ``;
}

export async function CreateItemBalanceRow(login: string, itemId: number) {
  const query = `INSERT INTO "store_item_balances" ("user_name", "item_id", "balance")
    VALUES ('${login}', ${itemId}, 0);`;
  try {
    const result = await connection.query(query);
    return true;
  } catch (e) {
    console.log('Error: ', e.message);
    return false;
  }
}

export async function GetUserItemBalance(
  login: string,
  itemId: number,
): Promise<number | null> {
  const query = `SELECT * FROM "store_item_balances" 
   WHERE "user_name" = '${login}' AND "item_id" = ${itemId};`;
  try {
    const result = await connection.query(query);
    return result.rows.length > 0 ? result.rows[0].balance : null;
  } catch (e) {
    console.log('Error: ', e.message);
    return null;
  }
}

export async function GetUserAllItemBalances(
  login: string,
): Promise<{itemId: number, balance: number}[] | null> {
  const query = `SELECT * FROM "store_item_balances" 
   WHERE "user_name" = '${login}';`;
  try {
    const result = await connection.query(query);
    const balances: {itemId: number, balance: number}[] = [];
    result.rows.forEach((item) => {
      balances.push({
        itemId: item.item_id,
        balance: item.balance
      })
    });
    return balances;
  } catch (e) {
    console.log('Error: ', e.message);
    return null;
  }
}

export async function IsItemAvailableToBuy(
  login: string,
  itemId: number,
  amount: number,
) {
  const storeItem = await GetStoreItem('id', itemId);
  const itemBalance = await GetUserItemBalance(login, itemId);
  const currencyBalance = await GetUserBalanceRow(login, login);

  if (!storeItem) {
    return {
      ok: false,
      error: 'Store item not exist',
    };
  }

  if (
    storeItem.per_user !== null &&
    itemBalance !== null &&
    itemBalance >= storeItem.per_user
  ) {
    return {
      ok: false,
      error: 'User balance reached amount available per one user',
    };
  }

  if (storeItem.total_count !== null && amount > storeItem.total_count) {
    return {
      ok: false,
      error: 'Amount larger than available for sale',
    };
  }

  if (storeItem.cost * amount > currencyBalance[storeItem.currency]) {
    return {
      ok: false,
      error: 'Insufficient funds to buy',
    };
  }
  return {
    ok: true,
    error: '',
  };
}

export async function BuyItem(buyer: string, itemId: number, amount: number) {
  const isAvailable = await IsItemAvailableToBuy(buyer, itemId, amount);
  if (!isAvailable.ok) {
    return isAvailable;
  }
  const itemBalance = await GetUserItemBalance(buyer, itemId);
  if (itemBalance === null) {
    await CreateItemBalanceRow(buyer, itemId);

  }
  const currencyQuery = `SELECT "currency", "cost" FROM "store_items" WHERE "id" = ${itemId};`;
  let currency = "";
  let cost = 0;
  console.log("Select dt query: ", currencyQuery);
  try {
    const currencyResult = await connection.query(currencyQuery);
    if (currencyResult.rows.length === 0) {
      return "Currency not found";
    }
    currency = currencyResult.rows[0].currency;
    cost = currencyResult.rows[0].cost;
    console.log(`Price: ${cost}, ${currency}`);
  } catch (e) {
    console.log("Select dt err: ", e.message);
    return e.message;
  }
  const balanceQuery = `UPDATE "store_item_balances" SET balance = balance + ${amount}
    WHERE "user_name" = '${buyer}' AND "item_id" = ${itemId};`;
  const storeQuery = `UPDATE "store_items" SET total_count = total_count - ${amount}
    WHERE "id" = ${itemId};`;
  const subBalanceQuery = `UPDATE "resources" SET ${currency} = ${currency} - ${cost} 
  where ownerlogin = '${buyer}' OR owneraddress = '${buyer}';`;
  console.log('Balance down query: ', subBalanceQuery)
  try {
    await connection.query(balanceQuery);
    await connection.query(storeQuery);
    await connection.query(subBalanceQuery);
    return {
      ok: true,
      error: '',
    };
  } catch (e) {
    console.log('Buy err: ', e.message)
    return {
      ok: false,
      error: e.message,
    };
  }
}
