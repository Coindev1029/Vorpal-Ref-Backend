import { TelegramAuthData } from '../../types';

const { connection } = require('../connection');

export async function SetPersonalData(
  data: TelegramAuthData,
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
        INSERT INTO  "telegram_personal" 
        ("user_id", "first_name", "last_name", "username", "last_auth_hash", "last_auth_date")
        VALUES ('${fd.id}', '${fd.first_name}', '${fd.last_name}', '${fd.username}', '${fd.hash}', ${fd.auth_date})
        ON CONFLICT ("user_id") DO UPDATE SET 
        "first_name" = '${fd.first_name}', 
        "last_name" = '${fd.last_name}', 
        "username" = '${fd.username}', 
        "last_auth_hash" = '${fd.hash}', 
        "last_auth_date" = ${fd.auth_date}
        WHERE "user_id" = '${fd.id}';
        `;
    console.log("Personal data query: ", query);
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
): Promise<TelegramAuthData | null> {
  return new Promise(async (resolve, reject) => {
    const query = `
          SELECT "user_id", "first_name", "last_name", "username", "last_auth_hash", "last_auth_date"
          FROM "telegram_personal" WHERE "username" = '${username}';
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
