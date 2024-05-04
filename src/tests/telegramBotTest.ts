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