import { Telegraf, Markup } from 'telegraf';
import { TelegramAuthData } from 'types';
import { CreateTelegramAuthHash } from 'utils/auth';
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
    ctx.reply("Duel creation started");
  }

  startCmdHandler = (ctx: any) => {
    const linkAuthDataPrev: TelegramAuthData = {
      auth_date: this.getLastAuthDate(),
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
          `${process.env.TELEGRAM_CLIENT_URL}&authHash=${authHash}` || '',
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
