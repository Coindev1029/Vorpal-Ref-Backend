import { runQuery as Q } from '../connection';
import { TelegramAuthData, TelegramAuthNote, tgUserTxnData } from '../../types';

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
  "last_auth_date" = excluded."last_auth_date",
  "chat_id" = excluded."chat_id",
  "inviter" = "telegram_personal"."inviter";
        `;
   const result = await Q(query, false);
   resolve(result ? true : false);
   return;
  });
}

export async function GetPersonalDataById(
  id: number,
): Promise<TelegramAuthNote | null> {
  return new Promise(async (resolve, reject) => {
    const query = `
        SELECT "user_id", "first_name", "last_name", "username", "last_auth_hash", "last_auth_date", "chat_id"
        FROM "telegram_personal" WHERE "user_id" = '${id}';
        `;
    const result = await Q(query);
    resolve(result && result.length > 0 ? {
      id: Number(result[0].user_id),
      first_name: result[0].first_name,
      last_name: result[0].last_name,
      username: result[0].username,
      hash: result[0].last_auth_hash,
      auth_date: Number(result[0].last_auth_date),
      chat_id: Number(result[0].chat_id || 0)
    } : null);
    return;
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
          const result = await Q(query);
          resolve(result && result.length > 0 ? {
            id: Number(result[0].user_id),
            first_name: result[0].first_name,
            last_name: result[0].last_name,
            username: result[0].username,
            hash: result[0].last_auth_hash,
            auth_date: Number(result[0].last_auth_date),
            chat_id: result[0].chat_id || 0
          } : null);
          return;
  });
}

export async function GetUserTransactions (login: string) {
  const query = `SELECT * FROM "resource_txn_log" WHERE "userlogin" = '${login.toLowerCase()}' ORDER BY "time" DESC;`;
  const txns = await Q(query);
  return txns && txns.length > 0 ? txns : []
}
