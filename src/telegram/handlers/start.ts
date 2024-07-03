import TelegramBot from 'node-telegram-bot-api';
import { TelegramAuthData, tgChannelData } from '../../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../../utils/auth';
import { SendSubscribeMessage } from './subscribe';
import { duel_lifetime, tg_chat_history_lifetime } from '../../config';
import { InlineKeyboard, MarkupKeyboard } from './keyboard';
import { IsUserInDuel, SetPersonalData } from '../../models/telegram';
import { SendMessageWithSave, SendPhotoWithSave, TruncateChat } from './utils';
import { messages } from '../constants';
import { DeleteMessagesByChatId, SaveMessage } from '../../models/telegram/history';

export const introPhotoPath = '/app/public/entry.png';

export const StartHandler = async (bot: TelegramBot, msg: TelegramBot.Message, match: any) => {
  console.log('Start handler called');
  const chatId = msg.chat.id;
  console.log('Chat started: ', chatId);
  SaveMessage(chatId, msg.message_id);
  if (!msg.from) return;
  // await SendMessageWithSave (bot, msg.chat.id, messages.welocme, MarkupKeyboard());
  try {
    const linkAuthDataPrev: TelegramAuthData = {
      auth_date: GetDaylyAuthDate(),
      last_name: msg.from.last_name?.replace(' ', '') || '',
      first_name: msg.from.first_name?.replace(' ', ''),
      id: msg.from.id,
      username: msg.from.username?.toLowerCase() || '',
      hash: '',
    };

    try {
      SetPersonalData(linkAuthDataPrev, chatId);
    } catch (e) {
      console.log(e.message);
    }

    if (!linkAuthDataPrev.username) {
      SendMessageWithSave(bot, chatId, messages.noUsername);
      return;
    }

    const isInDuel = await IsUserInDuel(linkAuthDataPrev.username) 
      if (isInDuel) {
        SendMessageWithSave(bot, chatId, messages.duelAlready);
        return;
      }

    // console.log('Last duel: ', createdDuel);
    const dateSec = Math.round(new Date().getTime() / 1000);

    await SendPhotoWithSave (bot, chatId, introPhotoPath, messages.duelStart, true, {
      reply_markup: InlineKeyboard(['enterGame', 'duel', 'joinCommunity', 'referrals']),
    });
    await SendSubscribeMessage(linkAuthDataPrev.id, chatId);

  } catch (e) {
    console.log('Start cmd exception: ', e);
    SendMessageWithSave(bot, chatId, 'Bot-side error');
  }
  /* setTimeout(() => {
    TruncateChat(bot, chatId)
  }, tg_chat_history_lifetime) */
};
