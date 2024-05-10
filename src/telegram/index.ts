import { Markup } from 'telegraf';
import { TelegramAuthData } from '../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../utils/auth';

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const tg_token = process.env.TELEGRAM_API_TOKEN; 

export function TelegramBotLaunch() {
  const bot = new TelegramBot(tg_token, { polling: true });

  const startHandler = (duel = false) => {return (msg, match) => {
    const chatId = msg.chat.id;
    if (duel) console.log('Match params', match);

    const linkAuthDataPrev: TelegramAuthData = {
      auth_date: GetDaylyAuthDate(),
      last_name: msg.from.last_name || '',
      first_name: msg.from.first_name,
      id: msg.from.id,
      username: msg.from.username || '',
      hash: '',
    };
    const authHash = CreateTelegramAuthHash(linkAuthDataPrev);
    const app_url = `${
      process.env.TELEGRAM_CLIENT_URL
    }?authHash=${authHash}&authDate=${GetDaylyAuthDate()}`;

    console.log("Url:", app_url);

    bot.sendMessage(
      chatId,
      'Welcome! Enter duel command to play with friends',
      Markup.keyboard([Markup.button.webApp('Start vorpal game', app_url)]),
    );
  }}

  bot.onText(/\/start/, startHandler(false));

  bot.onText(/\/start (.+)/, startHandler(true));

  bot.onText(/\/duel/, (msg) => {
    const chatId = msg.chat.id;

    const linkAuthDataPrev: TelegramAuthData = {
      auth_date: GetDaylyAuthDate(),
      last_name: msg.from.last_name || '',
      first_name: msg.from.first_name,
      id: msg.from.id,
      username: msg.from.username || '',
      hash: '',
    };
    const authHash = CreateTelegramAuthHash(linkAuthDataPrev);
    const app_url = `${
      process.env.TELEGRAM_CLIENT_URL
    }?authHash=${authHash}&authDate=${GetDaylyAuthDate()}`;

    const keyboard = {
      inline_keyboard: [[{ text: 'Send invitation', switch_inline_query: '' }]],
    };

    bot.sendMessage(chatId, 'Hello! Invite your friend to a duel:', {
      reply_markup: JSON.stringify(keyboard),
    });

    bot.sendMessage(
      chatId,
      'Your app url: ',
      Markup.keyboard([Markup.button.webApp('Start vorpal game', app_url)]),
    );
  });

  bot.on('inline_query', (query) => {
    const deepLink = `https://t.me/Wgl_starmaptest_bot?start=${query.from.username}`;

    const results = [
      {
        type: 'article',
        id: '1',
        title: 'Send invitation message',
        input_message_content: {
          message_text: `Duel call from ${query.from.first_name} ${query.from.last_name}`,
          parse_mode: 'Markdown',
        },
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Confirm invitation', url: deepLink }], //callback_data: metadataString
          ],
        },
      },
    ];

    bot.answerInlineQuery(query.id, results);
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
