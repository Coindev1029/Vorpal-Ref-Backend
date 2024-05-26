import { duelText, startText, tg_token } from './constants';
import TelegramBot from 'node-telegram-bot-api';
import { startHandler, duelHandler, duelAcceptHandler } from './handlers';

export const bot = new TelegramBot(tg_token, { polling: true });