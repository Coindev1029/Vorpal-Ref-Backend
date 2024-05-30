import { GetUserTransactions } from "../database/telegram";
import { CreateNewBox, OpenBox } from "../database/rewards/updaters";
import { TelegramAuthData } from "types";

async function BoxCreateOpenTest () {

    const testUser: TelegramAuthData = {
        id:9990999,
        first_name: 'test',
        last_name: 't',
        username: 'tester',
        hash: 'a4a4a4',
        auth_date: 1900000000
    }

    const box = await CreateNewBox(1, testUser.username, testUser.username);
    console.log("Created: ", box);
    if (box.max) {
        await OpenBox (box.max, testUser);
        const txns = await GetUserTransactions(testUser.username);
        console.log("History: ", txns);
    }
}

BoxCreateOpenTest ()