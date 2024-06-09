import TelegramBot from 'node-telegram-bot-api';
import { TxnHistoryAction, duelAcceptAction, duelCancelAction, duelRefuseAction } from './handlers/duel';
import { StartHandler } from './handlers/start';
import { duelText, startText, tg_token } from './constants';
import { bot } from './bot';
import { DuelCreationHandler } from './handlers/duelCreate';
import { DuelAcceptHandler } from './handlers/duelAccept';


export function TelegramBotLaunch() {
  bot.onText(/\/start/, async (msg, match) => {
    console.log("Start called");
    console.log("Match in start: ", match);
    const startDuelRegex = /\/start (.+)/;
    if (msg.text && startDuelRegex.test(msg.text)) {
        return;
    }

    await StartHandler(bot, msg);
  });

  bot.onText(/\/start (.+)/, async (msg, match) => {
    console.log("Duel accept called");
    await  DuelAcceptHandler(bot, msg, match);
  });

  bot.on('inline_query', async (query) => {
    const deepLink = `https://t.me/${
      process.env.TELEGRAM_BOT_NAME
    }?start=${query.from.username?.replace(' ', '')}`;

    console.log('Query info: ', query);

    const results: TelegramBot.InlineQueryResult[] = [
      {
        type: 'article',
        id: '1',
        title: 'Send invitation message',
        input_message_content: {
          message_text: `Duel call from ${query.from.first_name} ${
            query.from.last_name || ''
          }`,
          parse_mode: 'Markdown',
        },
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Confirm invitation', url: deepLink }], //callback_data: metadataString
          ],
        },
      },
    ];

    await bot.answerInlineQuery(query.id, results);
    return;
  });

  bot.on('callback_query', async (query: TelegramBot.CallbackQuery) => {
    console.log(query);
    if (!query.data) return; 
    const inviter = query.data.split("%")[1] || ""
    console.log("Invited by: ", inviter);
    switch (true) {
      case query.data === "duel":
        await DuelCreationHandler (bot, query);
        break;
      case query.data === "transactions":
        await TxnHistoryAction (bot, query);
        break;
      case query.data.indexOf("duelconfirm") > -1:
        await duelAcceptAction (bot, query, inviter);
        break;
      case query.data.indexOf("duelrefuse") > -1:
        await duelRefuseAction (bot, query, inviter);
        break;
      case  query.data.indexOf("duelcancel") > -1:
        await duelCancelAction (bot, query,  inviter);
        break;
    }
  });

  bot.on('message', async (msg) => {
    console.log("Received: ", msg.text);
    const txt: string = msg.text || "";
    switch (txt) {
      case "/start":
        break;
      case "/duel":
        break;
      default:
        await StartHandler (bot, msg)
    }
    console.log("Query processed: ", msg.text);
  });

  bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
  });

  bot.on('webhook_error', (error) => {
    console.error('Webhook error:', error);
  });

  bot.on('error', (error) => {
    console.error('Bot error:', error);
  });
}
