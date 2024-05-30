import { TelegramAuthData, TelegramAuthNote, tgUserTxnData } from '../../types';

const { connection } = require('../connection');

export async function SetPersonalData(
  data: TelegramAuthData,
  chat?: number,
  inviter?: string
): Promise<Boolean> {
  return new Promise(async (resolve, reject) => {
    const fd: TelegramAuthData = {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name || '',
      username: data.username?.toLowerCase() || '',
      auth_date: data.auth_date || 0,
      hash: data.hash || '',
    };
    const query = `
    INSERT INTO "telegram_personal" 
      ("user_id", "first_name", "last_name", "username", "last_auth_hash", "last_auth_date", "chat_id", "inviter")
    VALUES 
      ('${fd.id}', '${fd.first_name}', '${fd.last_name}', '${fd.username}', '${fd.hash}', ${fd.auth_date}, '${chat ? String(chat) : ""}', '${inviter || ""}')
    ON CONFLICT ("user_id") DO UPDATE SET
      "first_name" = excluded."first_name", 
      "last_name" = excluded."last_name", 
      "username" = excluded."username", 
      "last_auth_hash" = excluded."last_auth_hash", 
      "last_auth_date" = excluded."last_auth_date";
        `;

    try {
      await connection.query(query);
      resolve(true);
      return;
    } catch (e) {
      console.log(e.message);
      resolve(false);
      return;
    }
  });
}

export async function GetPersonalDataById(
  id: number,
): Promise<TelegramAuthData | null> {
  return new Promise(async (resolve, reject) => {
    const query = `
        SELECT "user_id", "first_name", "last_name", "username", "last_auth_hash", "last_auth_date"
        FROM "telegram_personal" WHERE "user_id" = '${id}';
        `;
    try {
      const result = await connection.query(query);
      if (result.rows.length > 0) {
        const data: TelegramAuthData = {
          id: Number(result.rows.user_id),
          first_name: result.first_name,
          last_name: result.last_name,
          username: result.username,
          hash: result.last_auth_hash,
          auth_date: Number(result.last_auth_date),
        };
        return data;
      } else {
        return null;
      }
    } catch (e) {
      console.log(e.message);
      return null;
    }
  });
}

export async function GetPersonalDataByUsername(
  username: string,
): Promise<TelegramAuthNote | null> {
  return new Promise(async (resolve, reject) => {
    const query = `
          SELECT "user_id", "first_name", "last_name", "username", "last_auth_hash", "last_auth_date", "chat_id"
          FROM "telegram_personal" WHERE "username" = '${username}';
          `;
    
    try {
      const result = await connection.query(query);
      if (result.rows.length > 0) {
        const data: TelegramAuthNote = {
          id: Number(result.rows.user_id),
          first_name: result.first_name,
          last_name: result.last_name,
          username: result.username,
          hash: result.last_auth_hash,
          auth_date: Number(result.last_auth_date),
          chat_id: result.chat_id || 0
        };
        resolve(data);
      } else {
        resolve(null);
      }
    } catch (e) {
      console.log(e.message);
      resolve(null);
    }
  });
}

export async function GetUserTransactions (login: string) {
  const query = `SELECT * FROM "resource_txn_log" WHERE "userlogin" = '${login.toLowerCase()}';`;
  const result: tgUserTxnData[] = [];
  try {
    const txns = await connection.query(query);
    txns.rows.forEach((r: tgUserTxnData) => {
      result.push(r)
    })
  } catch (e) {
    console.log(e.message);
  }
  return result;
}
