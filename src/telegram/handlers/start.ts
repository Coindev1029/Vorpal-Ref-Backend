import { TelegramAuthData, tgChannelData } from '../../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../../utils/auth';
import { SendSubscribeMessage } from './subscribe';
import { duel_lifetime } from '../../config';
import { InlineKeyboard } from './keyboard';

export const StartHandler =  async (bot, msg) => {
    console.log("Start handler called")
    const chatId = msg.chat.id;
    console.log('Chat started: ', chatId);
    try {
      const linkAuthDataPrev: TelegramAuthData = {
        auth_date: GetDaylyAuthDate(),
        last_name: msg.from.last_name?.replace(' ', '') || '',
        first_name: msg.from.first_name?.replace(' ', ''),
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

      console.log(
        'User: ',
        linkAuthDataPrev.username,
      );

      await SendSubscribeMessage(linkAuthDataPrev.id, chatId);

      // console.log('Last duel: ', createdDuel);
      const dateSec = Math.round(new Date().getTime() / 1000);


      bot.sendMessage(
        chatId,
        'Welcome! Enter duel command to play with friends',
        { reply_markup: InlineKeyboard(["duel"])},
      );
    } catch (e) {
      console.log('Start cmd exception: ', e);
      bot.sendMessage(chatId, 'Bot-side error');
    }
  };