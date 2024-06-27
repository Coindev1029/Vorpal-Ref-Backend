import { Q, connection } from '../connection';
import {
  ReferralStatsData,
  TelegramAuthData,
  TelegramAuthNote,
} from '../../types';


export async function GetUserInviter(username: string): Promise<string> {
  const query = `SELECT "inviter" FROM "telegram_personal" WHERE "username" = '${username}';`;
  try {
    const result = await connection.query(query);
    if (result.rows.length > 0) {
      return result.rows[0].inviter || '';
    } else {
      return '';
    }
  } catch (e) {
    console.log(e.message);
    return '';
  }
}

export async function GetUserInviterById(userId: string): Promise<string> {
  const query = `SELECT "inviter" FROM "telegram_personal" WHERE "user_id" = '${userId}';`;
  try {
    const result = await connection.query(query);
    if (result.rows.length > 0) {
      return result.rows[0].inviter || '';
    } else {
      return '';
    }
  } catch (e) {
    console.log(e.message);
    return '';
  }
}

export async function WriteReferralStats(data: {
  to: string;
  for: string;
  resource: string;
  amount: number;
  level: number;
  date?: number;
}) {
  const dt = data.date || Math.round(new Date().getTime() / 1000);
  const query = `INSERT INTO "telegram_referral_stats"  ("recipient", "referrer", "resource", "amount", "reward_date", "level") 
  VALUES ('${data.to.toLowerCase()}', '${data.for.toLowerCase()}', '${
    data.resource
  }', ${data.amount}, ${dt}, ${data.level});`;
  try {
    const result = await connection.query(query);
    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
}

export async function GetReferralList(inviter: string): Promise<string[]> {
  const query = `SELECT "username" FROM "telegram_personal" WHERE "inviter" = '${inviter}';`;
  const list: string[] = [];
  try {
    const result = await connection.query(query);
    result.rows.forEach((row) => {
      list.push(row.username);
    });
    return list;
  } catch (e) {
    console.log(e.message);
    return list;
  }
}

export async function GetReferralCount(inviter: string): Promise<{level1: number; level2: number;}> {
  const query1 = `SELECT COUNT(*) FROM "telegram_personal" WHERE "inviter" = '${inviter}';`;
  const level1 = await Q(query1, true);
  if (!level1) {
    return({
      level1: 0,
      level2: 0
    })
  }
  const query2=`SELECT COUNT(*) FROM "telegram_personal" WHERE "inviter" IN (SELECT "inviter" FROM "telegram_personal" WHERE "inviter" = '${inviter}');`;
  const level2 = await Q(query2, true);
  return({
    level1: level1[0].count,
    level2: level2? level2[0].count : 0
  })
}

export async function GetReferralStatsByUser(
  login: string,
): Promise<ReferralStatsData[]> {
  const result: ReferralStatsData[] = [];
  const query = `SELECT id, recipient, referrer, resource, amount, reward_date, level
	FROM "telegram_referral_stats" WHERE recipient = '${login.toLowerCase()}' ORDER BY reward_date DESC;`;
  try {
    const data = await connection.query(query);
    data.rows.forEach((row) => {
      result.push({
        id: row.id,
        to: row.recipient,
        for: row.referrer,
        resource: row.resource,
        amount: row.amount,
        level: row.level,
        date: row.reward_date,
      });
    });
  } catch (e) {
    console.log(e.message);
  }
  return result;
}
