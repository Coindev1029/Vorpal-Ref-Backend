import { TelegramAuthData, tgChannelData } from '../../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../../utils/auth';
import { SendSubscribeMessage } from './subscribe';
import { duel_lifetime, tg_chat_history_lifetime } from '../../config';
import { InlineKeyboard } from './keyboard';
import {
    GetDuelDataByInviter,
    SetPersonalData,
  } from '../../database/telegram';
import { duelConfirmText, duelRefuseText, duelText, inviteLink, messages, startText } from '../constants';
import { SaveMessage } from '../../database/telegram/history';
import { SendMessageWithSave, TruncateChat } from './utils';

export const DuelAcceptHandler = async (bot: any, msg: any, match: any) => {
  const chatId = msg.chat.id;
  console.log('Match params', match);
  try {
    if (!msg.from.username) {
      SendMessageWithSave(bot, chatId, messages.noUsername);
      return;
    }
    SaveMessage(chatId, msg.message_id);

    const linkAuthDataPrev: TelegramAuthData = {
      auth_date: GetDaylyAuthDate(),
      last_name: msg.from.last_name?.replace(' ', '') || '',
      first_name: msg.from.first_name?.replace(' ', ''),
      id: msg.from.id,
      username: msg.from.username?.toLowerCase() || '',
      hash: '',
    };
    try {
      SetPersonalData(linkAuthDataPrev, chatId)
    } catch (e) {
      console.log(e.message)
    }

    await SendSubscribeMessage(linkAuthDataPrev.id, chatId);

    if (!msg.from.username) {
      SendMessageWithSave(bot, chatId, messages.noUsername);
      return;
    }

    const inviterLogin = match[1]?.toLowerCase();

    if (!inviterLogin) {
      SendMessageWithSave(bot, chatId, messages.noInviter, { reply_markup: InlineKeyboard(["duel"])});
      return;
    }

    if (inviterLogin === linkAuthDataPrev.username) {
      SendMessageWithSave(bot, chatId, messages.inviteSelf);
      return;
    }

    const createdDuel = inviterLogin
      ? await GetDuelDataByInviter(inviterLogin)
      : null;

    if (!createdDuel) {
      SendMessageWithSave(bot, chatId, messages.duelNotFound, { reply_markup: InlineKeyboard(["duel"])});
      return;
    }

    const timeNow = Math.round(new Date().getTime() / 1000);

    if (
      createdDuel.isfinished &&
      timeNow - createdDuel.creation <= duel_lifetime
    ) {
      SendMessageWithSave(bot, chatId, messages.duelCancelled, { reply_markup: InlineKeyboard(["duel"])});
      return;
    }

    if (
      createdDuel.isexpired ||
      timeNow - createdDuel.creation > duel_lifetime
    ) {
      SendMessageWithSave(bot, chatId, messages.duelExpired, { reply_markup: InlineKeyboard(["duel"])});
      return;
    }

    if (createdDuel.login2) {
      SendMessageWithSave(bot, chatId, messages.duelBusy, { reply_markup: InlineKeyboard(["duel"])});
      return;
    }

    if (
      createdDuel.login2 ||
      createdDuel.isexpired ||
      createdDuel.isfinished ||
      timeNow - createdDuel.creation > duel_lifetime
    ) {
      SendMessageWithSave(bot, chatId, messages.duelBusy, { reply_markup: InlineKeyboard(["duel"])});
      return;
    }

    SendMessageWithSave(bot, 
      chatId,
      messages.duelAccept(inviterLogin),
      { reply_markup: InlineKeyboard(['duelConfirm', 'duelRefuse'], inviterLogin)},
    );
    return;
  } catch (e) {
    console.log('Error: ', e.message);
    SendMessageWithSave(bot, chatId, messages.serverError(e.message));
  }
  setTimeout(() => {
    TruncateChat(bot, chatId)
  }, tg_chat_history_lifetime)
};