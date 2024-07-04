import TelegramBot from 'node-telegram-bot-api';
import { TelegramAuthData, tgChannelData } from '../../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../../utils/auth';
import { SendSubscribeMessage } from './subscribe';
import { duel_lifetime, tg_chat_history_lifetime } from '../../config';
import { InlineKeyboard } from './keyboard';
import {
  AddDuelOpponent,
  GetDuelDataByInviter,
  GetDuelDataByUser,
  GetOpponent,
  GetPersonalDataByUsername,
  SetPersonalData,
} from '../../models/telegram';
import {
  duelConfirmText,
  duelRefuseText,
  duelText,
  inviteLink,
  messages,
  startText,
} from '../constants';
import { SaveMessage } from '../../models/telegram/history';
import { SendMessageWithSave, TruncateChat } from './utils';
import { GetUserInviter } from '../../models/telegram/referral';

export const DuelAcceptHandler = async (bot: TelegramBot, msg: any, match: any) => {
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

    const inviterLogin = match[1]?.toLowerCase();

    const inviterId = (await GetPersonalDataByUsername (inviterLogin))?.id;

    try {
      SetPersonalData(linkAuthDataPrev, chatId, String(inviterId || ""));
    } catch (e) {
      console.log(e.message);
    }

    await SendSubscribeMessage(linkAuthDataPrev.id, chatId);

    /* if (!msg.from.username) {
      SendMessageWithSave(bot, chatId, messages.noUsername);
      return;
    } */

    if (!inviterId) {
      SendMessageWithSave(bot, chatId, messages.noInviter, {
        reply_markup: InlineKeyboard(['duel']),
      });
      return;
    }

    if (inviterId === linkAuthDataPrev.id) {
      SendMessageWithSave(bot, chatId, messages.inviteSelf);
      return;
    }

    const createdDuel = inviterId
      ? await GetDuelDataByInviter(String(inviterId))
      : null;

    if (!createdDuel) {
      SendMessageWithSave(bot, chatId, messages.duelNotFound, {
        reply_markup: InlineKeyboard(['duel']),
      });
      return;
    }

    const timeNow = Math.round(new Date().getTime() / 1000);
    // ToDo: check duel condition
    if (
      createdDuel.isfinished &&
      timeNow - createdDuel.creation <= duel_lifetime
    ) {
      SendMessageWithSave(bot, chatId, messages.duelCancelled, {
        reply_markup: InlineKeyboard(['duel']),
      });
      return;
    }

    if (
      createdDuel.isexpired ||
      timeNow - createdDuel.creation > duel_lifetime
    ) {
      SendMessageWithSave(bot, chatId, messages.duelExpired, {
        reply_markup: InlineKeyboard(['duel']),
      });
      return;
    }

    if (
      (createdDuel.login2 &&
        createdDuel.login2 !== String(linkAuthDataPrev.id)) ||
      createdDuel.isexpired ||
      createdDuel.isfinished ||
      timeNow - createdDuel.creation > duel_lifetime
    ) {
      SendMessageWithSave(bot, chatId, messages.duelBusy, {
        reply_markup: InlineKeyboard(['duel']),
      });
      return;
    }

    await AddDuelOpponent(createdDuel.duel_id, String(linkAuthDataPrev.id));
    SendMessageWithSave(bot, chatId, messages.duelAccept(inviterLogin), {
      reply_markup: InlineKeyboard(['duelConfirm', 'duelRefuse'], inviterLogin),
    });

    const opponentData = await GetPersonalDataByUsername(String(inviterId));
    if (opponentData) {
      try {
        SendMessageWithSave(
          bot,
          opponentData.chat_id,
          messages.duelAcceptNotify(linkAuthDataPrev.username || ''),
          { reply_markup: InlineKeyboard(['duelConfirm']) },
        );
      } catch (e) {
        console.log(e.message);
      }
    }
    return;
  } catch (e) {
    console.log('Error: ', e.message);
    SendMessageWithSave(bot, chatId, messages.serverError(e.message));
  }
  setTimeout(() => {
    TruncateChat(bot, chatId);
  }, tg_chat_history_lifetime);
};
