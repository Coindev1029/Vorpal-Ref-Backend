const { connection } = require('../connection');

export async function SaveMessage(chat_id: number, message_id: number) {
  const query = `INSERT INTO "telegram_messages" ("chat_id", "message_id") VALUES ('${chat_id}', '${message_id}');`;
  try {
    await connection.query(query);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function GetMessagesByChatId(chat_id: number) {
  const query = `SELECT "message_id" FROM "telegram_messages" WHERE "chat_id" = '${chat_id}';`;
  const messages: number[] = [];
  try {
    const ids = await connection.query(query);
    ids.rows.forEach((item) => {
      messages.push(item.message_id);
    });
    return messages;
  } catch (e) {
    console.log(e);
    return messages;
  }
}

export async function DeleteMessagesByChatId(chat_id: number) {
  const query = `DELETE FROM "telegram_messages" WHERE "chat_id" = '${chat_id}';`;
  try {
    await connection.query(query);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
