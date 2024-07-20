import { duelText, startText, tg_token, old_token } from './constants';
import TelegramBot from 'node-telegram-bot-api';

export const bot = new TelegramBot(tg_token || "", { polling: true });

export const oldBot = old_token ? new TelegramBot(old_token || "", { polling: true }): null;