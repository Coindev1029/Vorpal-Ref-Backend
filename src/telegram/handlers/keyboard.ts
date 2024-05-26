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
  return Markup.keyboard([
    //  Markup.button.callback(startText, "start"),
    Markup.button.callback(duelText, 'duel'),
  ]);
};

export const InlineKeyboard = (...actions: string[]) => {
  const keyboard: any[] = [];
  actions.forEach((a) => {
    switch (a) {
      case 'duel':
        keyboard.push({
          text: duelText,
          callback_data: `duel`,
        });
        break;
      case 'duelConfirm':
        keyboard.push({
          text: duelConfirmText,
          callback_data: `dueconfirm`,
        });
        break;
      case 'duelRefuse':
        keyboard.push(
          {
            text: duelRefuseText,
            callback_data: `duelrefuse`,
          },
        );
        break;
    }
  });
  console.log({ inline_keyboard: [keyboard] });
  return { inline_keyboard: [keyboard] };
};
