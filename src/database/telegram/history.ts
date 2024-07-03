import { Q } from '../connection';

export async function SaveMessage(chat_id: number, message_id: number) {
  const query = `INSERT INTO "telegram_messages" ("chat_id", "message_id") VALUES ('${chat_id}', '${message_id}');`;
  const result = await Q(query, false);
  return result ? true : false
}

export async function GetMessagesByChatId(chat_id: number) {
  const query = `SELECT "message_id" FROM "telegram_messages" WHERE "chat_id" = '${chat_id}';`;
  const result = await Q(query);
  return result ? result.map((item) => {
    return Number(item.message_id)
  }) : []
}

export async function DeleteMessagesByChatId(chat_id: number) {
  const query = `DELETE FROM "telegram_messages" WHERE "chat_id" = '${chat_id}';`;
  const result = await Q(query, false);
  return result ? true : false
}
