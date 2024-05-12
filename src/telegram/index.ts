import { Markup } from 'telegraf';
import { TelegramAuthData, tgChannelData } from '../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../utils/auth';
import {
  AddDuelOpponent,
  CreateDuel,
  FinishDuel,
  GetDuelDataByUser,
  GetWatchingChannels,
  SetPersonalData,
} from '../database/telegram';
import { duel_lifetime } from '../config';

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const tg_token = process.env.TELEGRAM_API_TOKEN;

const bot = new TelegramBot(tg_token, { polling: true });

export async function GetChannelSubscribeList(userId: number): Promise<tgChannelData[]> {
  const channels = await GetWatchingChannels();
  const subscribes: tgChannelData[] = []
  // Markup.button.webApp('Start vorpal game', app_url)
  // inline_keyboard: [[{ text: 'Send invitation', switch_inline_query: '' }]]
  for (let j = 0; j < channels.length; j++) {
    // console.log("Channel: ", channels[j])
    try {
      const chatMember = await bot.getChatMember(channels[j].id, userId);
      if (!chatMember) {
        continue;
      }
      if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
        continue;
      } else {
        subscribes.push(channels[j])
      }
    } catch (e) {
      console.log("Chat error: ", String(channels[j].id), userId, e.message)
    }
  }
  console.log("Keyboard: ")
  return subscribes;
}

function GenereateSubscribeInlineKeyboard (channels: tgChannelData[]) {
  return [[channels.map((item) => {
    return { text: item.name, url: `https://t.me/${item.username.replace('@', '')}` }
  })]]
}

export function TelegramBotLaunch() {

  const startHandler = (duel = false) => {
    return async (msg, match) => {
      const chatId = msg.chat.id;
      console.log('Chat started: ', chatId);
      if (duel) console.log('Match params', match);

      try {
        const linkAuthDataPrev: TelegramAuthData = {
          auth_date: GetDaylyAuthDate(),
          last_name: msg.from.last_name || '',
          first_name: msg.from.first_name,
          id: msg.from.id,
          username: msg.from.username?.toLowerCase() || '',
          hash: '',
        };
        const authHash = CreateTelegramAuthHash(linkAuthDataPrev);
        const app_url = `${
          process.env.TELEGRAM_CLIENT_URL
        }?authHash=${authHash}&authDate=${GetDaylyAuthDate()}&id=${
          linkAuthDataPrev.id
        }&firstName=${linkAuthDataPrev.first_name}&lastName=${
          linkAuthDataPrev.last_name || ''
        }&userName=${linkAuthDataPrev.username || ''}`;

        console.log('Start user data: ', linkAuthDataPrev);

        SetPersonalData(linkAuthDataPrev);

        const inviterLogin = match[1];

        const subscribes = await GetChannelSubscribeList(linkAuthDataPrev.id);

        const subscribeMsg: any[] | null = subscribes.length === 0 ? null : 
        [chatId, "Subscribe on channels to get more prizes",, {
          reply_markup: JSON.stringify({inline_keyboard: GenereateSubscribeInlineKeyboard(subscribes)}),
        } ]


        if (duel && !msg.from.username) {
          bot.sendMessage(
            chatId,
            'Welcome! You need to have a visible username to enter a duel',
            Markup.keyboard([
              Markup.button.webApp('Start vorpal game', app_url),
            ]),
          );
          if (subscribeMsg) bot.sendMessage(...subscribeMsg);
          return;
        }

        const createdDuel = inviterLogin
          ? await GetDuelDataByUser(inviterLogin)
          : null;

        // console.log('Last duel: ', createdDuel);
        const dateSec = Math.round(new Date().getTime() / 1000);
        if (duel && linkAuthDataPrev.username === inviterLogin.toLowerCase()) {
          bot.sendMessage(
            chatId,
            `Enter starmap and wait your friend: `,
            Markup.keyboard([
              Markup.button.webApp('Start vorpal game', app_url),
            ]),
          );
          if (subscribeMsg) bot.sendMessage(...subscribeMsg);
          return;
        }
        if (!createdDuel) {
          bot.sendMessage(
            chatId,
            'Welcome! Enter duel command to play with friends',
            Markup.keyboard([
              Markup.button.webApp('Start vorpal game', app_url),
            ]),
          );
          if (subscribeMsg) bot.sendMessage(...subscribeMsg);
        } else {
          if (
            duel &&
            !createdDuel.isfinished &&
            dateSec - createdDuel.creation < duel_lifetime &&
            createdDuel.login1 &&
            !createdDuel.login2
          ) {
            await AddDuelOpponent(
              createdDuel.duel_id,
              msg.from.username?.toLowerCase(),
            );
            bot.sendMessage(
              chatId,
              `You joined to a duel with a @${inviterLogin}, go to starmap:`,
              Markup.keyboard([
                Markup.button.webApp('Start vorpal game', app_url),
              ]),
            );
            if (subscribeMsg) bot.sendMessage(...subscribeMsg);
            return;
          }
          if (
            duel &&
            !createdDuel.isfinished &&
            dateSec - createdDuel.creation > duel_lifetime
          ) {
            await FinishDuel(createdDuel.duel_id, '');
            bot.sendMessage(
              chatId,
              `Duel with a @${inviterLogin} is expired. You can create new or single play on starmap:`,
              Markup.keyboard([
                Markup.button.webApp('Start vorpal game', app_url),
              ]),
            );
            if (subscribeMsg) bot.sendMessage(...subscribeMsg);
            return;
          }
          if (
            !createdDuel.isfinished &&
            dateSec - createdDuel.creation < duel_lifetime
          ) {
            if (createdDuel.login1 && createdDuel.login2) {
              bot.sendMessage(
                chatId,
                'You already in duel, go to starmap:',
                Markup.keyboard([
                  Markup.button.webApp('Start vorpal game', app_url),
                ]),
              );
            } else {
              const keyboard = {
                inline_keyboard: [
                  [{ text: 'Send invitation', switch_inline_query: '' }],
                ],
              };

              bot.sendMessage(chatId, 'Duel created, invite a friend:', {
                reply_markup: JSON.stringify(keyboard),
              });

              bot.sendMessage(
                chatId,
                'Your app url: ',
                Markup.keyboard([
                  Markup.button.webApp('Start vorpal game', app_url),
                ]),
              );
            }
          }
          if (
            !createdDuel.isfinished &&
            dateSec - createdDuel.creation >= duel_lifetime
          ) {
            FinishDuel(createdDuel.duel_id, '');
          }
          if (subscribeMsg) bot.sendMessage(...subscribeMsg);
        }
      } catch (e) {
        console.log('Start cmd exception: ', e);
        bot.sendMessage(chatId, 'Bot-side error');
      }
    };
  };

  bot.onText(/\/start/, startHandler(false));

  bot.onText(/\/start (.+)/, startHandler(true));

  bot.onText(/\/duel/, async (msg) => {
    const chatId = msg.chat.id;

    const linkAuthDataPrev: TelegramAuthData = {
      auth_date: GetDaylyAuthDate(),
      last_name: msg.from.last_name || '',
      first_name: msg.from.first_name,
      id: msg.from.id,
      username: msg.from.username?.toLowerCase() || '',
      hash: '',
    };

    console.log('Duel user data: ', linkAuthDataPrev);

    const authHash = CreateTelegramAuthHash(linkAuthDataPrev);
    const app_url = `${
      process.env.TELEGRAM_CLIENT_URL
    }?authHash=${authHash}&authDate=${GetDaylyAuthDate()}&id=${
      linkAuthDataPrev.id
    }&firstName=${linkAuthDataPrev.first_name}&lastName=${
      linkAuthDataPrev.last_name || ''
    }&userName=${linkAuthDataPrev.username || ''}`;

    if (!msg.from.username) {
      bot.sendMessage(
        chatId,
        'You need to have a visible username to start a duel',
        Markup.keyboard([Markup.button.webApp('Start vorpal game', app_url)]),
      );
      return;
    }

    const userLastDuel = await GetDuelDataByUser(
      msg.from.username?.toLowerCase(),
    );
    // console.log('Last duel', userLastDuel);
    if (!userLastDuel) {
      await CreateDuel(msg.from.username?.toLowerCase(), '');
    } else {
      const isFinished = userLastDuel.isfinished;
      const creation = Number(userLastDuel.creation);
      const dateSec = Math.round(new Date().getTime() / 1000);
      if (
        !isFinished &&
        dateSec - creation < duel_lifetime &&
        userLastDuel.login1 &&
        userLastDuel.login2
      ) {
        bot.sendMessage(
          chatId,
          'You already in duel',
          Markup.keyboard([Markup.button.webApp('Start vorpal game', app_url)]),
        );
        return;
      }
      if (!isFinished && dateSec - creation >= duel_lifetime) {
        await FinishDuel(userLastDuel.duel_id, '');
        await CreateDuel(msg.from.username?.toLowerCase(), '');
      }
    }

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
