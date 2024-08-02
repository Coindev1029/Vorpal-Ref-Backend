import TelegramBot from 'node-telegram-bot-api';
import {
  AddDuelOpponent,
  FinishDuel,
  GetDuelDataByUser,
  GetOpponent,
  GetUserTransactions,
  RemoveDuelOpponent,
} from '../../models/telegram';
import { duel_lifetime } from '../../config';
import { bot } from '../bot';
import { duelText, inviteLink, messages, startText } from '../constants';
import { InlineKeyboard } from './keyboard';
import { SendMessageWithSave } from './utils';
import { GetReferralCount, GetReferralStatsByUser, GetReferralTotalRewardsByUser } from '../../models/telegram/referral';

export const ReferralStatsAction = async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
    console.log("History requested")
    if (!query.message) return;

    /* const transactions = await GetReferralStatsByUser (query.from.username);
    if (transactions.length === 0) {
        SendMessageWithSave (bot, query.message.chat.id, "No referral rewards yet");
        return;
    } */

    /*
    const historyText = `<b>Your rewards from referrals:</b>\n ${transactions.map((txn) => {
        return `LeveL: ${txn.level}, for: ${txn.for}, resource: ${txn.resource}, amount: ${txn.amount}\n`
   })}` */

    const refCounts = await GetReferralCount(String(query.from.id));
    const historyText = `
       <b>Level1: ${refCounts.level1}</b>
       <b>Level2: ${refCounts.level2}</b>
    `

    SendMessageWithSave (bot, query.message.chat.id, historyText,
     {
       parse_mode: "HTML",
       reply_markup: InlineKeyboard(['referralTotalRewards', 'referralRewardList']),
     });
    return;
}


export const referralTotalCountAction = async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
  if (!query.message) return;
  const counts = await GetReferralTotalRewardsByUser(String(query.from.id));
  const historyText = counts.length > 0 ? `<b>Your total rewards for referrals:</b>\n ${counts.map((item) => {
    return `Resource: ${item.item}, amount: +${item.amount}\n`
  })}` : `Still no rewards`
  SendMessageWithSave (bot, query.message.chat.id, historyText,
    {
      parse_mode: "HTML",
    });
}

export const referralLastTxnAction = async (bot: TelegramBot, query: TelegramBot.CallbackQuery) => {
  if (!query.message) return;
  const transactions = await GetReferralStatsByUser (String(query.from.id));
    if (transactions.length === 0) {
        SendMessageWithSave (bot, query.message.chat.id, "No referral rewards yet");
        return;
    }
    const historyText = `<b>Last receipts from your referrals:</b>\n ${transactions.map((txn) => {
      return `LeveL: ${txn.level}, resource: ${txn.resource}, amount: ${txn.amount}\n`
    })}`
    SendMessageWithSave (bot, query.message.chat.id, historyText,
    {
      parse_mode: "HTML",
    });
}

export const ReferralStatsHandler = async (bot: TelegramBot, query: TelegramBot.Message) => {

  if (!query?.from) return;
  /* if (!query?.from.username){
   SendMessageWithSave (bot, query.chat.id, messages.noUsername);
   return;
  } */

  const refCounts = await GetReferralCount(String(query.from.id));
  const historyText = `
     <b>Level1: ${refCounts.level1}</b>
     <b>Level2: ${refCounts.level2}</b>
  `

  SendMessageWithSave (bot, query.chat.id, historyText,
   {
     parse_mode: "HTML",
     reply_markup: InlineKeyboard(['referralTotalRewards', 'referralRewardList'])
   });
  return;
}