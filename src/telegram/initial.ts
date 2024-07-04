import TelegramBot from 'node-telegram-bot-api';
import { TxnHistoryAction, duelAcceptAction, duelCancelAction, duelRefuseAction } from './handlers/duel';
import { StartHandler } from './handlers/start';
import { duelText, messages, startText, tg_token, usingRegExps } from './constants';
import { bot } from './bot';
import { DuelCreationHandler } from './handlers/duelCreate';
import { DuelAcceptHandler } from './handlers/duelAccept';
import { SendMessageWithSave } from './handlers/utils';
import { MarkupKeyboard } from './handlers/keyboard';
import { NotABusyRegex } from '../utils/text';
import { ReferralStatsAction, ReferralStatsHandler } from './handlers/referral';
import { SetupBotMenuCommands } from './cmdSetup';
import { GetPersonalDataByUsername } from '../models/telegram';


export function TelegramBotLaunch() {

  SetupBotMenuCommands ();

  bot.onText(/\/start/, async (msg, match) => {
    const startDuelRegex = /\/start (.+)/;
    if (msg.text && startDuelRegex.test(msg.text)) {
        console.log("Condition to no call start")
        return;
    }

    await StartHandler(bot, msg, match);
  });

  bot.onText(/\/duel/, async (msg, match) => {

    await DuelCreationHandler (bot, msg);
  });

  bot.onText(/\/referral/, async (msg, match) => {

    await ReferralStatsHandler (bot, msg);
  });

  bot.onText(/\/start (.+)/, async (msg, match) => {

    await  DuelAcceptHandler(bot, msg, match);
  });

  bot.onText(/\/start(?:\?startapp=([^]+))?/, async (msg, match) => {
    console.log("Start app called")
    const inviterLogin = match ? match[1] : "" // Если inviterId присутствует в ссылке, он будет доступен здесь
    const inviterId = (await GetPersonalDataByUsername (inviterLogin))?.id;
    if (inviterLogin) {
        bot.sendMessage(msg.chat.id, `You have invited by: ${inviterLogin}`);
    } 
  });

  bot.on('inline_query', async (query) => {
    const deepLink = `https://t.me/${
      process.env.TELEGRAM_BOT_NAME
    }?start=${query.from.username?.replace(' ', '')}`;

    const startappLink = `https://t.me/${process.env.TELEGRAM_BOT_NAME}/vtester?startapp=inviterId_${String(query.from.id)}`;

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
            [{ text: 'Confirm invitation', url: startappLink }], //callback_data: metadataString
          ],
        },
      },
    ];

    await bot.answerInlineQuery(query.id, results);
    return;
  });

  bot.on('callback_query', async (query: TelegramBot.CallbackQuery) => {
    if (!query.data) return; 
    const inviter = query.data.split("%")[1] || ""
    switch (true) {
      case query.data === "duel":
        await DuelCreationHandler (bot, query);
        break;
      case query.data === "transactions":
        await TxnHistoryAction (bot, query);
        break;
      case query.data === "referrals":
        await ReferralStatsAction (bot, query)
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

  bot.on('message', async (msg, match) => {
    const txt: string = msg.text || "";
    switch (true) {
      case txt === "Start": 
        await StartHandler (bot, msg, match)
        break;
      case txt === "Duel": 
        await DuelCreationHandler (bot, msg)
        break;
      case txt === "start": 
        await StartHandler (bot, msg, match)
        break;
      case txt.length < 3:
        await StartHandler (bot, msg, match)
        break;
      case NotABusyRegex (txt, usingRegExps):
        await StartHandler (bot, msg, match)
        break;
    }
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
