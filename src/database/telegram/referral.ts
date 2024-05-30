import { TelegramAuthData, TelegramAuthNote } from '../../types';

const { connection } = require('../connection');

export async function GetUserInviter (username: string): Promise<string> {
    const query = `SELECT "inviter" FROM "telegram_personal" WHERE "username" = '${username}';`;
    try {
      const result = await connection.query(query);
      if (result.rows.length > 0) {
        return result.rows[0].inviter || "";
      } else {
        return ""
      }
    } catch (e) {
      console.log(e.message);
      return ""
    }
}

export async function GetUserInviterById (userId: string): Promise<string> {
    const query = `SELECT "inviter" FROM "telegram_personal" WHERE "user_id" = '${userId}';`;
    try {
      const result = await connection.query(query);
      if (result.rows.length > 0) {
        return result.rows[0].inviter || "";
      } else {
        return ""
      }
    } catch (e) {
      console.log(e.message);
      return ""
    }
}

export async function GetReferralList (inviter: string): Promise<string[]> {
   const query = `SELECT "username" FROM "telegram_personal" WHERE "inviter" = '${inviter}';`;
   const list: string[] = []
   try {
    const result = await connection.query(query);
      result.rows.forEach((row) => {
        list.push(row.username);
      })
      return list;
   } catch (e) {
    console.log(e.message)
     return list;
   }
}