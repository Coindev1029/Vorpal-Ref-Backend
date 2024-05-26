require('dotenv').config();

export const front_v = process.env.FRONTEND_VERSION || '407';
export const tg_token = process.env.TELEGRAM_API_TOKEN;
export const inviteLink = "https://t.me/${process.env.TELEGRAM_BOT_NAME}?start=";
export const startText = "Start";
export const duelText = "Create duel";
export const duelConfirmText = "Confirm duel";
export const duelRefuseText = "Refuse a duel";

export const messages = {
    welocme: `
      Welocme to a Star defender game app powered by Vorpal engine! <br /> 
      You now can start a duel with your friend or play demo with bot`,
    noUsername: `
      Welcome! You need to have a Telegram username to enter a duel or to start it
    `,
    noInviter: `
      Hello! You have invited to a duel but user not found. You can create ypur own:
    `,
    inviteSelf: `
      Hello! You cannot play with yourself
    `,
    subscribeRequest: `Subscribe on channels to get more prizes`,
    duelCreatedShareInfo: `
       Duel created! 
       Now to invite a friend share him the next message with your link below:
    `,
    duelInvitation: (inviter: string) => `
      Hello! I am ${inviter} inviting you to play with me 
      in a Star defender game powered by Vorpal
      <a href="${inviteLink}${inviter}">Accept invitation and play</a>:
    `,
    duelAccept:  (inviter: string) => `
      Welcome to a Star defender! <br />
      You now have a duel invitation from ${inviter}.
      Choose to confirm or refuse a duel:
    `,
    duelNotFound: `
      Duel with your inviter not found. You can create a new one: 
    `,
    duelComfirmed: `
      Great! Noe to start a battle open a game app: 
    `,
    duelRefused: `
      Your duel invitation cancelled. You can play with bot
      or create a your own duel: `,
    duelCancelled: `
      Your duel is cancelled. You can play with bot or create a new one:
    `,
    duelBusy: `
      Your inviter already in duel with someone else. 
      You can create a your own:
    `,
    duelExpired: `
      Duel for your invitation is already finished or cancelled by creator.
      You can create a new one:
    `,
    serverError: (message: string) =>  `
      Server side error: ${message}
    `
}
