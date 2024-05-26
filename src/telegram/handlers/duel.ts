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
} from '../../database/telegram';
import { duel_lifetime } from '../../config';
import { bot } from '../bot';
import { duelText, inviteLink, messages, startText } from '../constants';


export const duelCreateAction = (query: any) => {

}

export const duelCancelAction = (query: any) => {
    
}

export const duelAcceptAction = (query: any) => {
    
}
