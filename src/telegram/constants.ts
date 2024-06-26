require('dotenv').config();

export const front_v = process.env.FRONTEND_VERSION || '407';
export const tg_token = process.env.TELEGRAM_API_TOKEN;
export const inviteLink = `https://t.me/${process.env.TELEGRAM_BOT_NAME}?start=`;
export const startText = "Start";
export const duelText = "Create duel";
export const enterGameText = "Launch starmap";
export const joinText = "Join community";
export const duelConfirmText = "Enter a duel";
export const duelRefuseText = "Refuse a duel";

export const communityTgUrl = "https://t.me/VorpalAnnouncements";

export const usingRegExps: RegExp[] = [
  /\/start/,
  /\/start (.+)/,
  /\/start(?:\?startapp=([^]+))?/
];

export const messages = {
    welocme: `
      Welocme to a Star defender game app powered by Vorpal engine!
      You now can start a duel with your friend or play demo with bot`,
    noUsername: `
      Welcome! You need to have a Telegram username to enter a duel or to start it
    `,
    noInviter: `
      Hello! You have been invited to a duel but user not found. You can create a your own:
    `,
    duelRefiseInvitation: (login2: string) => {
      return `@${login2} cancelled an invitation. You can challenge a new player`
    },
    duelStart: `Hello! Welocme to a Star defender game app powered by Vorpal engine!
      You now can start a duel with your friend or play demo with bot. Enter command from list below:`,
    duelStartWithWelcome: `Welcome! Enter duel command to play with friends`,
    duelAlready: `You already in duel, got to Starmap to enter a battle`,
    duelToForward: `Forvard this message to challenge your friend:`,
    duelCancelDescript: `If you want to cancel a duel, press here:`,
    inviteSelf: `
      Hello! You have a created duel. Enter game and wait your friend to accept invitation.
    `,
    subscribeRequest: `Subscribe on channels to get more prizes`,
    duelCreatedShareInfo: `
       Duel created! 
       Now to challenge a friend share him the next message with your link below:
    `,
    duelInvitation: (inviter: string) => {
      const deepLink = `${inviteLink}${inviter?.replace(
        ' ',
        '',
      )}`;
      const startappLink = `https://t.me/${process.env.TELEGRAM_BOT_NAME}/vtester?startapp=inviterId_${inviter?.replace(' ', '')}`;
      return `@${inviter} challenging you to Star Defender duel: <a href="${startappLink}">Accept</a>`
    },
    duelAccept:  (inviter: string) => `
      Welcome to a Star defender! 
      You now have a duel challenge with @${inviter}.
      Enter a starmap or cancel:
    `,
    duelAcceptNotify: (user: string) => `
      @${user} accepted your challenge. Enter game to start battle
    `,
    duelNotFound: `
      Duel with your inviter not found. You can create a new one: 
    `,
    duelComfirmed: `
      Great! Now to start a battle open a game app: 
    `,
    duelRefused: `
      Your duel invitation cancelled. You can play with bot
      or create a new duel: `,
    duelCancelled: `
      Your duel has been cancelled. You can play with bot or create a new one:
    `,
    duelBusy: `
      Your inviter already in duel with someone else. 
      You can create a your own:
    `,
    duelExpired: `
      Duel for your invitation is already finished or cancelled by creator.
      You can create a new one:
    `,
    duelCancelOpponentNotify: (author: string) => {
      return `@${author} cancelled a challenge with you`
    },
    duelCancelYouNotify: (author: string) => {
      return `Challenge with @${author} cancelled`
    },
    serverError: (message: string) =>  `
      Server side error: ${message}
    `
}
