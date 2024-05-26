import { TelegramAuthData, tgChannelData } from '../../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../../utils/auth';
import { SendSubscribeMessage } from './subscribe';
import { duel_lifetime } from '../../config';
import { InlineKeyboard } from './keyboard';
import {
    AddDuelOpponent,
    CreateDuel,
    FinishDuel,
    GetDuelDataByInviter,
    GetDuelDataByUser,
    GetWatchingChannels,
    SetPersonalData,
  } from '../../database/telegram';
import { duelConfirmText, duelRefuseText, duelText, inviteLink, messages, startText } from '../constants';

export const DuelCreationHandler = async (bot, msg) => {
    const chatId = msg.chat.id;
    console.log("Duel handler called")
  
    const linkAuthDataPrev: TelegramAuthData = {
      auth_date: GetDaylyAuthDate(),
      last_name: msg.from.last_name?.replace(' ', '') || '',
      first_name: msg.from.first_name?.replace(' ', ''),
      id: msg.from.id,
      username: msg.from.username?.toLowerCase() || '',
      hash: '',
    };
  
    if (!msg.from.username) {
      bot.sendMessage(
        chatId,
        'You need to have a visible username to start a duel',
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
        bot.sendMessage(chatId, 'You already in duel, got to Starmap to enter a battle');
        return;
      }
      if (!isFinished || dateSec - creation >= duel_lifetime) {
        console.log('Finish duel case 3');
        await FinishDuel(userLastDuel.duel_id, '');
        const duelId = await CreateDuel(msg.from.username?.toLowerCase(), '');
        console.log('Created, id: ', duelId);
      }
      // console.log('Duel creation, last condition passed 3');
      // await CreateDuel(msg.from.username?.toLowerCase(), '');
    }
  
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: 'Send invitation',
            switch_inline_query: `Enter a duel with: ${linkAuthDataPrev.username}`,
          },
        ],
      ],
    };
  
    const deepLink = `${inviteLink}${linkAuthDataPrev.username?.replace(
      ' ',
      '',
    )}`;
  
    bot.sendMessage(
      chatId,
      `Hello! Forvard this message to invite your friend to a duel:`,
    );
  
    bot.sendMessage(
      chatId,
      `Hello! Enter a duel with me: <a href="${deepLink}">Link</a>:`,
      {
        parse_mode: 'HTML',
        // reply_markup: JSON.stringify(keyboard),
      },
    );

  };
