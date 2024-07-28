import { GetUserTransactions } from "../models/telegram";
import { CreateNewBox, openBox } from "../models/rewards/updaters";
import { TelegramAuthData } from "types";

async function BoxCreateOpenTest () {

    const testUser: TelegramAuthData = {
        id:6261378577,
        first_name: 'test',
        last_name: 't',
        username: 'tester',
        hash: 'a4a4a4',
        auth_date: 1900000000
    }

    const box = await CreateNewBox(1, String(testUser.id), String(testUser.id));
    console.log("Created: ", box);
    if (box.max) {
        await openBox (box.max, testUser);
        const txns = await GetUserTransactions(String(testUser.id) || "");
        console.log("History: ", txns);
    }
}

BoxCreateOpenTest ()