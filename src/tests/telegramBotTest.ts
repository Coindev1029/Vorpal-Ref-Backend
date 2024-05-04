import { InitTelegramClient } from "../telegram";

console.log("Telergram bot testing...");
InitTelegramClient().then((res) => {
    console.log("Finished: ", res)
}).catch((e) => {
    console.log("Error found: ", e)
}); 