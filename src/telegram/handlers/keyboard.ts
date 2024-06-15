import { Markup } from 'telegraf';
import {
  duelConfirmText,
  duelRefuseText,
  duelText,
  inviteLink,
  messages,
  startText,
} from '../constants';

export const MarkupKeyboard = () => {
  return {
    reply_markup: {
      keyboard: [
        [{ text: 'Start' }],
        [{ text: 'Duel' }],
      ],
      resize_keyboard: true
    }
  };
};

export const InlineKeyboard = (actions: string[], inviter?: string) => {
  const keyboard: any[] = [];
  actions.forEach((a) => {
    switch (true) {
      case a === 'duel':
        keyboard.push({
          text: duelText,
          callback_data: `duel`,
        });
        break;
      case a.indexOf('duelConfirm') > -1:
        keyboard.push({
          text: duelConfirmText,
          web_app: {"url": `${process.env.TELEGRAM_CLIENT_URL}`}
        });
        break;
      case a.indexOf('duelRefuse') > -1:
        keyboard.push({
          text: duelRefuseText,
          callback_data: `${a.toLowerCase()}%${inviter || ""}`,
        });
        break;
        case a.indexOf('duelCancel') > -1:
            keyboard.push({
              text: "Cancel a duel",
              callback_data: `${a.toLowerCase()}%${inviter || ""}`,
            });
        break;
      case a === "transactions":
        keyboard.push({
          text: "Watch transactions",
          callback_data: `transactions`,
        });
        break;
      case a === "referrals":
        keyboard.push({
            text: "Watch referrals",
            callback_data: `referrals`,
        });
        break;
      default:
        keyboard.push({
          text: "Press action",
          callback_data: `${a.toLowerCase()}`,
        });
        break;
    }
  });
  console.log({ inline_keyboard: [keyboard] });
  return { inline_keyboard: [keyboard] };
};
