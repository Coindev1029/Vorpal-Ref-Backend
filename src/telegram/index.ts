import { Telegraf, Markup } from 'telegraf';
require('dotenv').config();

export async function InitTelegramClient() {
  return new Promise((resolve, reject) => {
    const tg_token = process.env.TELEGRAM_API_TOKEN;
    console.log("Token: ", tg_token);
  
    if (!tg_token) {
      reject("Api token not found");
      return;
    }

    const bot = new Telegraf(tg_token);
    
    bot.command('start', (ctx) => {
      ctx.reply(
        'Press btn to start game',
        Markup.keyboard([
          Markup.button.webApp(
            'Start vorpal game',
            process.env.TELEGRAM_CLIENT_URL || '',
          ),
        ]),
      );
    });
  })
}

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

  public start() {
    this.bot.command('start', (ctx) => {
      ctx.reply(
        'Press btn to start game',
        Markup.keyboard([
          Markup.button.webApp(
            'Start vorpal game',
            process.env.TELEGRAM_CLIENT_URL || '',
          ),
        ]),
      );
    });
  }

  public stop() {
    this.bot.stop();
  }
}
