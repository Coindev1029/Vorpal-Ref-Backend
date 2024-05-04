import { Telegraf, Markup } from 'telegraf';
require('dotenv').config();

export async function InitTelegramClient() {
  const tg_token = process.env.TELEGRAM_API_TOKEN;
  console.log("Token: ", tg_token);

  if (!tg_token) return;
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
}
