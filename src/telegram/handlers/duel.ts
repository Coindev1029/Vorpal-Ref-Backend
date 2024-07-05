import TelegramBot from 'node-telegram-bot-api';
import {
  AddDuelOpponent,
  DeleteDuel,
  FinishDuel,
  GetDuelDataByUser,
  GetOpponent,
  GetPersonalDataById,
  GetUserTransactions,
  RemoveDuelOpponent,
} from '../../models/telegram';
import { duel_lifetime } from '../../config';
import { bot } from '../bot';
import { duelText, inviteLink, messages, startText } from '../constants';
import { InlineKeyboard } from './keyboard';
import { SendMessageWithSave } from './utils';
import { NotifyDuelFinishFor } from '../../models/external';

export const duelCancelAction = async (
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  opponent: string = '',
) => {
  if (!query.message?.chat.id) {
    console.log('Chat not found');
    return;
  }
  const chatId = query.message.chat.id;
  const sender: string = String(query?.from?.id || '');
  if (sender) {
    const duel = await GetDuelDataByUser(sender.toLowerCase());
    console.log('Cancelled duel: ', duel);
    if (duel && duel.isfinished) {
      SendMessageWithSave(bot, chatId, "Duel is already finished");
      return;
    }
    if (duel) {
      /* if (duel.login2) {
        try {
          NotifyDuelFinishFor(duel.login2);
        } catch (e) {
          console.log(e.message);
        }
      } */
      await DeleteDuel(duel.duel_id);
      // await FinishDuel(duel.duel_id, '');
      SendMessageWithSave(bot, chatId, messages.duelCancelled, {
        reply_markup: InlineKeyboard(['duel']),
      });
    } else {
      SendMessageWithSave(bot, chatId, messages.duelNotFound, {
        reply_markup: InlineKeyboard(['duel']),
      });
    }
  } else {
    SendMessageWithSave(bot, chatId, messages.duelNotFound, {
      reply_markup: InlineKeyboard(['duel']),
    });
  }
};

export const duelAcceptAction = async (
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  inviter?: string,
) => {
  if (!query.message?.chat.id) {
    console.log('Chat not found');
    return;
  }

  const duel = await GetDuelDataByUser(inviter?.toLowerCase() || '');

  if (!duel) {
    bot.sendMessage(query.message.chat.id, messages.duelNotFound);
    return;
  }
  const player = String(query?.message?.from?.id || '');

  /* if (!player) {
    bot.sendMessage(query.message.chat.id, messages.noUsername);
    return;
  } */

  await AddDuelOpponent(duel.duel_id, player);
  bot.sendMessage(query.message.chat.id, messages.duelComfirmed);
  if (inviter && player) {
    const opponentData = await GetPersonalDataById(Number(inviter));
    const from = query?.message?.from
    if (opponentData) {
      SendMessageWithSave(
        bot,
        opponentData.chat_id,
        messages.duelAcceptNotify(from?.username || from?.first_name || "Anonimous", from?.username ? true : false),
      );
    }
  }
};

export const duelRefuseAction = async (
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  inviter: string,
) => {
  if (!query.message?.chat.id) {
    console.log('Chat not found');
    return;
  }
  const caller = query?.from?.id;
  if (!caller || !query.from || !query.from.username) {
    return;
  }

  const duelOpponent = ((await GetOpponent(String(caller))) || inviter);
  const opponentData = await GetPersonalDataById(Number(duelOpponent));
  const duelData = await GetDuelDataByUser (String(caller));

  if (opponentData) {

      try {
        NotifyDuelFinishFor(String(opponentData.id), duelData?.duel_id || "");
      } catch (e) {
        console.log("Notify err");
      } 

    SendMessageWithSave(
      bot,
      opponentData.chat_id,
      messages.duelCancelOpponentNotify(String(query.from.id)),
    );
    SendMessageWithSave(
      bot,
      query.message.chat.id,
      messages.duelCancelYouNotify(opponentData.username || opponentData.first_name),
    );

    const removeResult = await RemoveDuelOpponent(String(caller));

    SendMessageWithSave(bot, query.message.chat.id, messages.duelRefused, {
      reply_markup: InlineKeyboard(['duel']),
    });
  }

};

export const TxnHistoryAction = async (
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
) => {
  console.log('History requested');
  if (!query.message) return;
  if (!query.from) {
    SendMessageWithSave(bot, query.message.chat.id, messages.noUsername);
    return;
  } 
  const transactions = await GetUserTransactions(String(query.from?.id || ""));
  const historyText = `<b>Your transactions:</b>\n ${transactions.map((txn) => {
    console.log('Find txn: ', txn);
    return `${txn.resource} ${txn.amount} ${txn.reason}\n`;
  })}`;
  console.log('History: ', historyText);
  SendMessageWithSave(bot, query.message.chat.id, historyText, {
    parse_mode: 'HTML',
  });
  return;
};
