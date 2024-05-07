const { connection } = require('./connection');
const md5 = require('md5');

export async function IsUserInDuel(user: string) {
  const query = `SELECT "duel_id" FROM "duels" WHERE ("login1" = '${user}' OR "login2" = '${user}') AND isfinished = false;`;
  try {
    const result = await connection.query(query);
    if (result.rows.length > 0) {
      return result.rows[0].duel_id;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export async function GetDuelData(duelId: string) {
  const query = `SELECT "login1", "login2", "creation", "isfinished", "winner" FROM "duels" WHERE "duel_id" = '${duelId}';`;
  try {
    const result = await connection.query(query);
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export async function GetOpponent (login: string) {
  const query = `SELECT "login2" FROM "duels" WHERE "isfinished" = false AND "login1" = ${login};`;
  try {
    const result = await connection.query(query);
    if (result.rows.length > 0) {
      return result.rows[0].login2;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export async function FinishDuel(duelId: string, winner: string) {
  const query = `UPDATE "duels" SET isfinished = true, winner = '${winner}' WHERE "duel_id" = '${duelId}';`;
  try {
    const result = await connection.query(query);
    if (result.rows.length > 0) {
      return true;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export async function CreateDuel(login1: string, login2: string) {
  const dt = Math.round(new Date().getTime() / 1000);
  const duel_id = md5(`${dt}_${login1}_${login2}`);
  if ((await IsUserInDuel(login1)) || (await IsUserInDuel(login2))) return null;
  const query = `INSERT INTO "duels" 
    ("duel_id", "login1", "login2", "creation", "isfinished", "isexpired", "winner") 
    VALUES ('${duel_id}', '${login1}', '${login2}', ${dt}, false, false, '');`;
  try {
    const result = await connection.query(query);
    return duel_id;
  } catch (e) {
    return null;
  }
  return;
}
