import { bot } from "./bot";

export function SetupBotMenuCommands () {
    try {
        const cmd = bot.setMyCommands([
            { command: '/start', description: 'Get started' },
            { command: '/duel', description: 'Create duel' },
            { command: '/referral', description: 'Referral info' }
          ]);
        console.log("Result: ", cmd)
    } catch (e: any) {
        console.log("Error: ", e.message)
    }
    
}
