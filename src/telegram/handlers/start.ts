import TelegramBot from 'node-telegram-bot-api';
import { TelegramAuthData, tgChannelData } from '../../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../../utils/auth';
import { SendSubscribeMessage } from './subscribe';
import { duel_lifetime, tg_chat_history_lifetime } from '../../config';
import { InlineKeyboard } from './keyboard';
import { IsUserInDuel, SetPersonalData } from '../../database/telegram';
import { SendMessageWithSave, TruncateChat } from './utils';
import { messages } from '../constants';
import { DeleteMessagesByChatId, SaveMessage } from '../../database/telegram/history';

export const StartHandler = async (bot: TelegramBot, msg: TelegramBot.Message) => {
  console.log('Start handler called');
  const chatId = msg.chat.id;
  console.log('Chat started: ', chatId);
  SaveMessage(chatId, msg.message_id);
  if (!msg.from) return;
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


    console.log('User: ', linkAuthDataPrev.username);

    await SendSubscribeMessage(linkAuthDataPrev.id, chatId);

    // console.log('Last duel: ', createdDuel);
    const dateSec = Math.round(new Date().getTime() / 1000);

    SendMessageWithSave(bot, chatId, messages.duelStart, {
      reply_markup: InlineKeyboard(['duel']),
    });
  } catch (e) {
    console.log('Start cmd exception: ', e);
    SendMessageWithSave(bot, chatId, 'Bot-side error');
  }
  setTimeout(() => {
    TruncateChat(bot, chatId)
  }, tg_chat_history_lifetime)
};
