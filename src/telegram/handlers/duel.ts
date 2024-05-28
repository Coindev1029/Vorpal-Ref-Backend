import TelegramBot from 'node-telegram-bot-api';
import {
  AddDuelOpponent,
  FinishDuel,
  GetDuelDataByUser,
} from '../../database/telegram';
import { duel_lifetime } from '../../config';
import { bot } from '../bot';
import { duelText, inviteLink, messages, startText } from '../constants';
import { InlineKeyboard } from './keyboard';

export const duelCancelAction = async (bot: TelegramBot, query) => {
  if (!query.message.chat.id) {
    console.log('Chat not found');
    return;
  }
  const sender: string = query?.message?.from?.username || '';
  if (sender) {
    const duel = await GetDuelDataByUser(sender.toLowerCase());
    if (duel) {
      await FinishDuel(duel.duel_id, '');
      bot.sendMessage(query.message.chat.id, messages.duelCancelled, {
        reply_markup: InlineKeyboard(['duel']),
      });
    } else {
      bot.sendMessage(query.message.chat.id, messages.duelNotFound);
    }
  } else {
    bot.sendMessage(query.message.chat.id, messages.duelNotFound);
  }
};

export const duelAcceptAction = async (bot: TelegramBot, query, inviter?: string) => {
  if (!query.message.chat.id) {
    console.log('Chat not found');
    return;
  }
  const duel = await GetDuelDataByUser(inviter?.toLowerCase() || '');
  if (!duel) {
    bot.sendMessage(query.message.chat.id, messages.duelNotFound);
    return;
  }
  const player = query?.message?.from?.username || '';

  if (!player) {
    bot.sendMessage(query.message.chat.id, messages.noUsername);
    return;
  }

  await AddDuelOpponent(duel.duel_id, player);
  bot.sendMessage(query.message.chat.id, messages.duelComfirmed);
};

export const duelRefuseAction = async (bot: TelegramBot, query, inviter?: string) => {
  if (!query.message.chat.id) {
    console.log('Chat not found');
    return;
  }
  bot.sendMessage(query.message.chat.id, messages.duelRefused);
};
