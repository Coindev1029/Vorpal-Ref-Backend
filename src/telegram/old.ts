import { oldBot } from "./bot"
import { messages } from "./constants";


export function initOldBot () {
    if (!oldBot) {
        console.log("No old bot present");
        return;
    }
    console.log("Old bot notify started");
    oldBot?.on('message', (msg) => {
        oldBot?.sendMessage(msg.chat.id, messages.old);
    })
 }