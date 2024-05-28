require('dotenv').config();

export const front_v = process.env.FRONTEND_VERSION || '407';
export const tg_token = process.env.TELEGRAM_API_TOKEN;
export const inviteLink = `https://t.me/${process.env.TELEGRAM_BOT_NAME}?start=`;
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
    duelStart: `Welcome! Enter duel command to play with friends`,
    duelAlready: `You already in duel, got to Starmap to enter a battle`,
    duelToForward: `Hello! Forvard this message to invite your friend to a duel`,
    inviteSelf: `
      Hello! You have a created duel. Enter game and wait your friend to accept invitation.
    `,
    subscribeRequest: `Subscribe on channels to get more prizes`,
    duelCreatedShareInfo: `
       Duel created! 
       Now to invite a friend share him the next message with your link below:
    `,
    duelInvitation: (inviter: string) => {
      const deepLink = `${inviteLink}${inviter?.replace(
        ' ',
        '',
      )}`;
      return `Hello! Enter a duel with me: <a href="${deepLink}">Accept duel</a>`
    },
    duelAccept:  (inviter: string) => `
      Welcome to a Star defender! 
      You now have a duel invitation from @${inviter}.
      Choose to confirm or refuse a duel:
    `,
    duelNotFound: `
      Duel with your inviter not found. You can create a new one: 
    `,
    duelComfirmed: `
      Great! Now to start a battle open a game app: 
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
