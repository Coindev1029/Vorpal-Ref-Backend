import { Telegraf, Markup } from 'telegraf';
import { TelegramAuthData } from '../types';
import { CreateTelegramAuthHash, GetDaylyAuthDate } from '../utils/auth';
require('dotenv').config();

export class TelegramBotServer {
  tg_token: string;
  bot: Telegraf;
   
  constructor() {
    const token = process.env.TELEGRAM_API_TOKEN;
    if (!token) {
      throw new Error("Telegram token not found")
    }
    this.tg_token = token;
    this.bot = new Telegraf(this.tg_token);
  }

  getLastAuthDate = (): number => {
     const dt = new Date().getTime();
     return Math.round((dt - (dt % 86400000)) / 1000);
  }

  duelStartCmdHandler = (ctx: any) => {
    let btn = { 
      reply_markup: JSON.stringify({ 
        inline_keyboard: [ 
          [{ text: 'Invite friend', callback_data: '1' }], 
        ] 
      }) 
    }; 

    ctx.reply("Duel creation started", btn);
  }

  startCmdHandler = (ctx: any) => {
    const linkAuthDataPrev: TelegramAuthData = {
      auth_date: GetDaylyAuthDate(),
      last_name: ctx.from.last_name || "",
      first_name: ctx.from.first_name,
      id: ctx.from.id,
      username: ctx.from.username || "",
      hash: ""
    }
    const authHash = CreateTelegramAuthHash(linkAuthDataPrev);

    ctx.reply(
      'Press btn to start game',
      Markup.keyboard([
        Markup.button.webApp(
          'Start vorpal game',
          `${process.env.TELEGRAM_CLIENT_URL}&authHash=${authHash}&authDate=${GetDaylyAuthDate()}` || '',
        ),
      ]),
    );
  }

  public start() {
    this.bot.command('start', this.startCmdHandler);
    this.bot.command('new_duel', this.duelStartCmdHandler);
    this.bot.launch();
  }

  public stop() {
    this.bot.stop();
  }
}
