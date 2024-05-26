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

export const DuelAcceptHandler = async (bot: any, msg: any, match: any) => {
  const chatId = msg.chat.id;
  console.log('Match params', match);
  try {
    if (!msg.from.username) {
      bot.sendMessage(chatId, messages.noUsername);
      return;
    }

    const linkAuthDataPrev: TelegramAuthData = {
      auth_date: GetDaylyAuthDate(),
      last_name: msg.from.last_name?.replace(' ', '') || '',
      first_name: msg.from.first_name?.replace(' ', ''),
      id: msg.from.id,
      username: msg.from.username?.toLowerCase() || '',
      hash: '',
    };

    await SendSubscribeMessage(linkAuthDataPrev.id, chatId);

    if (!msg.from.username) {
      bot.sendMessage(chatId, messages.noUsername);
      return;
    }

    const inviterLogin = match[1]?.toLowerCase();

    if (!inviterLogin) {
      bot.sendMessage(chatId, messages.noInviter, InlineKeyboard('duel'));
      return;
    }

    if (inviterLogin === linkAuthDataPrev.username) {
      bot.sendMessage(chatId, messages.inviteSelf);
      return;
    }

    const createdDuel = inviterLogin
      ? await GetDuelDataByInviter(inviterLogin)
      : null;

    if (!createdDuel) {
      bot.sendMessage(chatId, messages.duelNotFound, InlineKeyboard('duel'));
      return;
    }

    const timeNow = Math.round(new Date().getTime() / 1000);

    if (
      createdDuel.isfinished &&
      timeNow - createdDuel.creation <= duel_lifetime
    ) {
      bot.sendMessage(chatId, messages.duelCancelled, InlineKeyboard('duel'));
      return;
    }

    if (
      createdDuel.isexpired ||
      timeNow - createdDuel.creation > duel_lifetime
    ) {
      bot.sendMessage(chatId, messages.duelExpired, InlineKeyboard('duel'));
      return;
    }

    if (createdDuel.login2) {
      bot.sendMessage(chatId, messages.duelBusy, InlineKeyboard('duel'));
      return;
    }

    if (
      createdDuel.login2 ||
      createdDuel.isexpired ||
      createdDuel.isfinished ||
      timeNow - createdDuel.creation > duel_lifetime
    ) {
      bot.sendMessage(chatId, messages.duelBusy, InlineKeyboard('duel'));
      return;
    }

    bot.sendMessage(
      chatId,
      messages.duelInvitation(inviterLogin),
      InlineKeyboard('duelConfirm', 'duelRefuse'),
    );
    return;
  } catch (e) {
    console.log('Error: ', e.message);
    bot.sendMessage(chatId, messages.serverError(e.message));
  }
};