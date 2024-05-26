import { Markup } from 'telegraf';
import { TelegramAuthData, tgChannelData } from '../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../utils/auth';
import {
  AddDuelOpponent,
  CreateDuel,
  FinishDuel,
  GetDuelDataByInviter,
  GetDuelDataByUser,
  GetWatchingChannels,
  SetPersonalData,
} from '../database/telegram';
import { duel_lifetime } from '../config';
import { duelText, startText, tg_token } from './constants';
import TelegramBot from 'node-telegram-bot-api';
import { startHandler, duelHandler, duelAcceptHandler } from './handlers';

export const bot = new TelegramBot(tg_token, { polling: true });

export function TelegramBotLaunch() {
  bot.onText(/\/start/, startHandler(false));

  bot.onText(/\/start (.+)/, duelAcceptHandler);

  bot.onText(/\/duel/, duelHandler);

  bot.on('inline_query', async (query) => {
    const deepLink = `https://t.me/${
      process.env.TELEGRAM_BOT_NAME
    }?start=${query.from.username?.replace(' ', '')}`;

    console.log('Query info: ', query);

    const results = [
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
        cache_time: 0,
      },
    ];

    await bot.answerInlineQuery(query.id, results);
    return;
  });

  bot.on('callback_query', async (query) => {
    console.log(query);
  });

  bot.on('message', async (query) => {
    console.log(query);
    switch (query.text) {
      case startText:
        startHandler();
        break;
      case duelText:
        duelHandler(query);
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
