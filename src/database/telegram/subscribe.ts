import { tgChannelData } from '../../types';

const { connection } = require('../connection');

export async function AddChannelToWatching(channelData: tgChannelData) {
  const query = `
    INSERT INTO "watching_tg_subscriptions" ("channel_name", "channel_username", "channel_id")
    VALUES ('${channelData.name}', '${channelData.username}', '-1001853369268');`;
  try {
    await connection.query(query);
    return true;
  } catch (e) {
    console.log('Err: ', e.message);
    return false;
  }
}

export async function DeleteChannelFromWatching(userName: string) {
  const query = `DELETE FROM "watching_tg_subscriptions" WHERE "channel_username" = '${userName}';`;
  try {
    await connection.query(query);
    return true;
  } catch (e) {
    console.log('Err: ', e.message);
    return false;
  }
}

export async function GetWatchingChannels(): Promise<tgChannelData[]> {
  const query = `SELECT "channel_name", "channel_username", "channel_id" FROM "watching_tg_subscriptions";`;

  try {
    const result = await connection.query(query);
    const chennels: tgChannelData[] = result.rows.map((row) => {
      const ch: tgChannelData = {
        name: row.channel_name,
        username: row.channel_username,
        id: Number(row.channel_id),
      };
      return ch;
    });
    return chennels;
  } catch (e) {
    console.log('Err: ', e.message);
    return [];
  }
}
