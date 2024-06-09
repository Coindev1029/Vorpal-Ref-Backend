import TelegramBot from 'node-telegram-bot-api';
import { TelegramAuthData, tgChannelData } from '../../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../../utils/auth';
import { SendSubscribeMessage } from './subscribe';
import { duel_lifetime, testPhotoPath, testPhotoUrl } from '../../config';
import { InlineKeyboard } from './keyboard';
import {
  CreateDuel,
  FinishDuel,
  GetDuelDataByUser,
} from '../../database/telegram';
import {
  duelConfirmText,
  duelRefuseText,
  duelText,
  inviteLink,
  messages,
  startText,
} from '../constants';
import { SendMessageWithSave, SendPhotoWithSave } from './utils';
import { SaveMessage } from '../../database/telegram/history';

export const DuelCreationHandler = async (
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
) => {
  if (!query.message) {
    return;
  }
  const chat = query.message.chat;
  const chatId = chat.id;
  console.log('Duel handler called');

  const linkAuthDataPrev: TelegramAuthData = {
    auth_date: GetDaylyAuthDate(),
    last_name: query.from.last_name?.replace(' ', '') || '',
    first_name: query.from.first_name?.replace(' ', '') || '',
    id: query.from.id,
    username: query.from.username?.toLowerCase() || '',
    hash: '',
  };

  console.log('Duel from user: ', linkAuthDataPrev);

  if (!linkAuthDataPrev.username) {
    SendMessageWithSave(bot, chatId, messages.noUsername);
    return;
  }
  const dateSec = Math.round(new Date().getTime() / 1000);
  const userLastDuel = await GetDuelDataByUser(
    linkAuthDataPrev.username?.toLowerCase(),
  );
  if (!userLastDuel) {
    await CreateDuel(linkAuthDataPrev.username?.toLowerCase(), '');
  } else {
    const isFinished = userLastDuel.isfinished;
    const creation = Number(userLastDuel.creation);
    if (
      !isFinished &&
      dateSec - creation < duel_lifetime &&
      userLastDuel.login1 &&
      userLastDuel.login2
    ) {
      SendMessageWithSave(bot, chatId, messages.duelAlready);
      return;
    }
    if (!isFinished || dateSec - creation >= duel_lifetime) {
      console.log('Finish duel case 3');
      await FinishDuel(userLastDuel.duel_id, '');
      const duelId = await CreateDuel(
        linkAuthDataPrev.username?.toLowerCase(),
        '',
      );
      console.log('Created, id: ', duelId);
    }
    // console.log('Duel creation, last condition passed 3');
    // await CreateDuel(msg.from.username?.toLowerCase(), '');
  }

  await SendMessageWithSave(bot, chatId, messages.duelToForward).then(()=> {
    SendPhotoWithSave(
      bot,
      chatId,
      testPhotoPath,
      messages.duelInvitation(linkAuthDataPrev.username),
      true,
      {
        parse_mode: 'HTML',
      },
    ).then(() => {
      SendMessageWithSave(bot, chatId, messages.duelCancelDescript, {
        reply_markup: InlineKeyboard(['duelCancel']),
      });
    })
  })
};
