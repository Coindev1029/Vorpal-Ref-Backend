import { Telegraf, Markup } from "telegraf";
import { InitTelegramClient, TelegramBotServer } from "../telegram";
require('dotenv').config();

console.log("Telergram bot testing...");

/* InitTelegramClient().then((res) => {
    console.log("Finished: ", res)
}).catch((e) => {
    console.log("Error found: ", e)
}); */

const tgServer = new TelegramBotServer();

tgServer.start();

const tg_token = process.env.TELEGRAM_API_TOKEN;

if (!tg_token) {
    throw new Error("Telegram token not found")
  }

const bot = new Telegraf(tg_token);

bot.command('start', (ctx) => {
  console.log("Commant start received")
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

bot.launch();