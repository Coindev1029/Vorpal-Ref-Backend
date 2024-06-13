import TelegramBot from 'node-telegram-bot-api';
import {
  AddDuelOpponent,
  FinishDuel,
  GetDuelDataByUser,
  GetOpponent,
  GetPersonalDataByUsername,
  GetUserTransactions,
  RemoveDuelOpponent,
} from '../../database/telegram';
import { duel_lifetime } from '../../config';
import { bot } from '../bot';
import { duelText, inviteLink, messages, startText } from '../constants';
import { InlineKeyboard } from './keyboard';
import { SendMessageWithSave } from './utils';
import { GetReferralStatsByUser } from '../../database/telegram/referral';

export const ReferralStatsAction = async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    console.log("History requested")
    if (!query.message) return;
    if (!query.from.username){
     SendMessageWithSave (bot, query.message.chat.id, messages.noUsername);
     return;
    }
    const transactions = await GetReferralStatsByUser (query.from.username);
    if (transactions.length === 0) {
        SendMessageWithSave (bot, query.message.chat.id, "No referral rewards yet");
        return;
    }
    const historyText = `<b>Your rewards from referrals:</b>\n ${transactions.map((txn) => {
        return `LeveL: ${txn.level}, for: ${txn.for}, resource: ${txn.resource}, amount: ${txn.amount}\n`
   })}`
    console.log("History: ", historyText)
    SendMessageWithSave (bot, query.message.chat.id, historyText,
     {
       parse_mode: "HTML",
     });
    return;
}