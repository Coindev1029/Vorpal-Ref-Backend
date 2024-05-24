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
import { bot } from './initial';
import { duelText, inviteLink, startText } from './constants';


export const MarkupKeyboard = () => {
    return Markup.keyboard([
    //  Markup.button.callback(startText, "start"),
      Markup.button.callback(duelText, "duel")
    ])
  }

export async function GetChannelSubscribeList(
    userId: number,
  ): Promise<tgChannelData[]> {
    const channels = await GetWatchingChannels();
    console.log("Subscriptions to watch: ", channels);
    const subscribes: tgChannelData[] = [];
  
    for (let j = 0; j < channels.length; j++) {
      // console.log("Channel: ", channels[j])
      try {
        const chatMember = await bot.getChatMember(channels[j].id, userId);
        if (!chatMember) {
          continue;
        }
        console.log("Member status: ", chatMember.status);
        if (
          chatMember.status === 'member' ||
          chatMember.status === 'administrator' ||
          chatMember.status === 'creator'
        ) {
          continue;
        } else {
          subscribes.push(channels[j]);
        }
      } catch (e) {
        console.log('Chat error: ', String(channels[j].id), userId, e.message);
      }
    }
    return subscribes;
  }

export const duelInviteHandler = (msg: any, match: any) => {
    const chatId = msg.chat.id;
    
}

export const startHandler = (duel = false) => {
    return async (msg, match) => {
      const chatId = msg.chat.id;
      console.log('Chat started: ', chatId);
      if (duel) console.log('Match params', match);

      try {
        const linkAuthDataPrev: TelegramAuthData = {
          auth_date: GetDaylyAuthDate(),
          last_name: msg.from.last_name?.replace(" ", "") || '',
          first_name: msg.from.first_name?.replace(" ", ""),
          id: msg.from.id,
          username: msg.from.username?.toLowerCase() || '',
          hash: '',
        };

        if (!linkAuthDataPrev.username) {
          bot.sendMessage(
            chatId,
            'Welcome! You need to have a Telegram username to play',
          );
          return;
        }
        const authHash = CreateTelegramAuthHash(linkAuthDataPrev);

        const inviterLogin = match[1]?.toLowerCase();

        console.log("User: ", linkAuthDataPrev.username, "Inviter: ", inviterLogin);

        const subscribes = await GetChannelSubscribeList(linkAuthDataPrev.id);

        const inlineButtons = subscribes.map((item) => ({
          text: item.name,
          url: `https://t.me/${item.username.replace('@', '')}`,
        }));

        const keyboardS = {
          inline_keyboard: [inlineButtons],
        };

        const subscribeMsg: any[] | null =
          subscribes.length === 0
            ? null
            : [
                chatId,
                'Subscribe on channels to get more prizes',
                {
                  reply_markup: keyboardS,
                },
              ];

        if (duel && !msg.from.username) {
          bot.sendMessage(
            chatId,
            'Welcome! You need to have a Telegram username to enter a duel',
            MarkupKeyboard(),
          );
          if (subscribeMsg) bot.sendMessage(...subscribeMsg);
          return;
        }

        const createdDuel = inviterLogin
          ? await GetDuelDataByInviter(inviterLogin)
          : null;
        console.log("Find duel: ", createdDuel, "For user: ", linkAuthDataPrev.username)
        // console.log('Last duel: ', createdDuel);
        const dateSec = Math.round(new Date().getTime() / 1000);
        if (!createdDuel) {
          bot.sendMessage(
            chatId,
            'Welcome! Enter duel command to play with friends',
            MarkupKeyboard(),
          );
          if (subscribeMsg) bot.sendMessage(...subscribeMsg);
          return;
        } 
        if (duel && linkAuthDataPrev.username === inviterLogin.toLowerCase()) {
          bot.sendMessage(
            chatId,
            `Enter starmap and wait your friend: `,
            MarkupKeyboard(),
          );
          if (subscribeMsg) bot.sendMessage(...subscribeMsg);
          return;
        }
        if (!createdDuel) {
          bot.sendMessage(
            chatId,
            'Welcome! Enter duel command to play with friends',
            MarkupKeyboard(),
          );
          if (subscribeMsg) bot.sendMessage(...subscribeMsg);
        } else {
          console.log("Inviter duel info: ", createdDuel, dateSec - createdDuel.creation)
          if (
            duel &&
            !createdDuel.isfinished &&
            // dateSec - createdDuel.creation < duel_lifetime &&
            createdDuel.login1 &&
            (!createdDuel.login2 || createdDuel.login2 === linkAuthDataPrev.username)
          ) {
            await AddDuelOpponent(
              createdDuel.duel_id,
              msg.from.username?.toLowerCase(),
            );
            bot.sendMessage(
              chatId,
              `You joined to a duel with a @${inviterLogin}, go to starmap:`,
              MarkupKeyboard(),
            );
            if (subscribeMsg) bot.sendMessage(...subscribeMsg);
            return;
          }
          if (
            duel &&
            !createdDuel.isfinished &&
            dateSec - createdDuel.creation > duel_lifetime
          ) {
            console.log("Finish duel case 1")
            await FinishDuel(createdDuel.duel_id, '');
            bot.sendMessage(
              chatId,
              `Duel with a @${inviterLogin} is expired. You can create new or single play on starmap:`,
              MarkupKeyboard(),
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
                MarkupKeyboard(),
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
                MarkupKeyboard(),
              );

              /* Markup.keyboard([
                  Markup.button.webApp('Start vorpal game', app_url),
                ]) 
              */
            }
          }
          if (
            !createdDuel.isfinished &&
            dateSec - createdDuel.creation >= duel_lifetime
          ) {
            console.log("Finish duel case 2")
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

export const duelHandler = async (msg) => {
    const chatId = msg.chat.id;

    const linkAuthDataPrev: TelegramAuthData = {
      auth_date: GetDaylyAuthDate(),
      last_name: msg.from.last_name?.replace(" ", "") || '',
      first_name: msg.from.first_name?.replace(" ", ""),
      id: msg.from.id,
      username: msg.from.username?.toLowerCase() || '',
      hash: '',
    };

    if (!msg.from.username) {
      bot.sendMessage(
        chatId,
        'You need to have a visible username to start a duel',
        MarkupKeyboard(),
      );
      return;
    }
    const dateSec = Math.round(new Date().getTime() / 1000);
    const userLastDuel = await GetDuelDataByUser(
      msg.from.username?.toLowerCase(),
    );
    if (!userLastDuel) {
      await CreateDuel(msg.from.username?.toLowerCase(), '');
    } else {
      const isFinished = userLastDuel.isfinished;
      const creation = Number(userLastDuel.creation);
      if (
        !isFinished &&
        dateSec - creation < duel_lifetime &&
        userLastDuel.login1 &&
        userLastDuel.login2
      ) {
        bot.sendMessage(
          chatId,
          'You already in duel',
          MarkupKeyboard(),
        );
        return;
      }
      if (!isFinished || dateSec - creation >= duel_lifetime) {
        console.log("Finish duel case 3")
        await FinishDuel(userLastDuel.duel_id, '');
        const duelId = await CreateDuel(msg.from.username?.toLowerCase(), '');
        console.log('Created, id: ', duelId);
      }
      // console.log('Duel creation, last condition passed 3');
      // await CreateDuel(msg.from.username?.toLowerCase(), '');
    }

    const keyboard = {
      inline_keyboard: [[{ text: 'Send invitation', switch_inline_query: `Enter a duel with: ${linkAuthDataPrev.username}` }]],
    };

    const deepLink = `${inviteLink}${linkAuthDataPrev.username?.replace(" ", "")}`;

    bot.sendMessage(chatId, `Hello! Forvard this message to invite your friend to a duel, <a href="${deepLink}">Link</a>:`, {
      parse_mode: 'HTML',
      // reply_markup: JSON.stringify(keyboard),
    });

    bot.sendMessage(
      chatId,
      'Your app url: ',
      MarkupKeyboard(),
    );
  }