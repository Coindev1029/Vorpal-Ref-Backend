import { Telegraf, Markup } from "telegraf";
import { TelegramBotServer } from "../telegram";
require('dotenv').config();

console.log("Telergram bot testing...");

const tgServer = new TelegramBotServer();

tgServer.start();
