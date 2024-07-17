import { Markup } from 'telegraf';
import { TelegramAuthData, tgChannelData } from '../../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../../utils/auth';
import {
  AddDuelOpponent,
  CreateDuel,
  FinishDuel,
  GetDuelDataByInviter,
  GetDuelDataByUser,
  GetWatchingChannels,
  SetPersonalData,
} from '../../models/telegram';
import { duel_lifetime } from '../../config';
import { bot } from '../bot';
import { duelText, inviteLink, messages, startText } from '../constants';
import { SendMessageWithSave } from './utils';

export async function SendSubscribeMessage(userId: number, chatId: number) {
  const subscribes = await GetChannelSubscribeList(userId);

  const inlineButtons = subscribes.map((item) => ({
    text: item.name,
    url: `https://t.me/${item.username.replace('@', '')}`,
  }));

  const keyboardS = {
    inline_keyboard: [inlineButtons],
  };

  if (subscribes.length > 0) {
    await SendMessageWithSave(bot, chatId, messages.subscribeRequest, {
      reply_markup: keyboardS,
    });
  }
}

export async function GetChannelSubscribeList(
  userId: number,
): Promise<tgChannelData[]> {
  const channels = await GetWatchingChannels();
  console.log('Subscriptions to watch: ', channels);
  const subscribes: tgChannelData[] = [];

  for (let j = 0; j < channels.length; j++) {
    // console.log("Channel: ", channels[j])
    try {
      const chatMember = await bot.getChatMember(channels[j].id, userId);
      if (!chatMember) {
        continue;
      }
      console.log('Member status: ', chatMember.status);
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
