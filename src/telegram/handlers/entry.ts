import { Markup } from 'telegraf';
import { TelegramAuthData, tgChannelData } from '../../types';
import { GetDaylyAuthDate, CreateTelegramAuthHash } from '../../utils/auth';
import {
  AddDuelOpponent,
  CreateDuel,
  FinishDuel,
  GetDuelDataByInviter,
  GetDuelDataByUser,
  GetWatchingChannels,
  SetPersonalData,
} from '../../database/telegram';
import { duel_lifetime } from '../../config';
import { bot } from '../bot';
import { duelConfirmText, duelRefuseText, duelText, inviteLink, messages, startText } from '../constants';
import { SendSubscribeMessage } from './subscribe';

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
        keyboard.push(
          {
            text: duelText,
            callback_query: `duel`,
          },
        );
        break;
      case 'duelConfirm':
          keyboard.push(
            {
              text: duelConfirmText,
              callback_data: `dueconfirm`,
            },
          );
          break;
      case 'duelRefuse':
          keyboard.push([
            {
              text: duelRefuseText,
              callback_data: `duelrefuse`,
            },
          ]);
          break;
    }
  });
  console.log({ inline_keyboard: keyboard})
  return( { inline_keyboard: keyboard});
};

export const duelAcceptHandler = async (msg: any, match: any) => {
  const chatId = msg.chat.id;
  console.log('Match params', match);
  try {
    if (!msg.from.username) {
      bot.sendMessage(chatId, messages.noUsername, MarkupKeyboard());
      return;
    }

    const linkAuthDataPrev: TelegramAuthData = {
      auth_date: GetDaylyAuthDate(),
      last_name: msg.from.last_name?.replace(' ', '') || '',
      first_name: msg.from.first_name?.replace(' ', ''),
      id: msg.from.id,
      username: msg.from.username?.toLowerCase() || '',
      hash: '',
    };

    await SendSubscribeMessage(linkAuthDataPrev.id, chatId);

    if (!msg.from.username) {
      bot.sendMessage(chatId, messages.noUsername);
      return;
    }

    const inviterLogin = match[1]?.toLowerCase();

    if (!inviterLogin) {
      bot.sendMessage(chatId, messages.noInviter, InlineKeyboard('duel'));
      return;
    }

    if (inviterLogin === linkAuthDataPrev.username) {
      bot.sendMessage(chatId, messages.inviteSelf);
      return;
    }

    const createdDuel = inviterLogin
      ? await GetDuelDataByInviter(inviterLogin)
      : null;

    if (!createdDuel) {
      bot.sendMessage(chatId, messages.duelNotFound, InlineKeyboard('duel'));
      return;
    }

    const timeNow = Math.round(new Date().getTime() / 1000);

    if (
      createdDuel.isfinished &&
      timeNow - createdDuel.creation <= duel_lifetime
    ) {
      bot.sendMessage(chatId, messages.duelCancelled, InlineKeyboard('duel'));
      return;
    }

    if (
      createdDuel.isexpired ||
      timeNow - createdDuel.creation > duel_lifetime
    ) {
      bot.sendMessage(chatId, messages.duelExpired, InlineKeyboard('duel'));
      return;
    }

    if (createdDuel.login2) {
      bot.sendMessage(chatId, messages.duelBusy, InlineKeyboard('duel'));
      return;
    }

    if (
      createdDuel.login2 ||
      createdDuel.isexpired ||
      createdDuel.isfinished ||
      timeNow - createdDuel.creation > duel_lifetime
    ) {
      bot.sendMessage(chatId, messages.duelBusy, InlineKeyboard('duel'));
      return;
    }

    bot.sendMessage(
      chatId,
      messages.duelInvitation(inviterLogin),
      InlineKeyboard('duelConfirm', 'duelRefuse'),
    );
    return;
  } catch (e) {
    console.log('Error: ', e.message);
    bot.sendMessage(chatId, messages.serverError(e.message));
  }
};

export const startHandler =  async (msg) => {
    console.log("Start handler called")
    const chatId = msg.chat.id;
    console.log('Chat started: ', chatId);
    try {
      const linkAuthDataPrev: TelegramAuthData = {
        auth_date: GetDaylyAuthDate(),
        last_name: msg.from.last_name?.replace(' ', '') || '',
        first_name: msg.from.first_name?.replace(' ', ''),
        id: msg.from.id,
        username: msg.from.username?.toLowerCase() || '',
        hash: '',
      };

      if (!linkAuthDataPrev.username) {
        bot.sendMessage(
          chatId,
          'Welcome! You need to have a Telegram username to play',
        );
        return;
      }

      console.log(
        'User: ',
        linkAuthDataPrev.username,
      );

      await SendSubscribeMessage(linkAuthDataPrev.id, chatId);

      // console.log('Last duel: ', createdDuel);
      const dateSec = Math.round(new Date().getTime() / 1000);


      bot.sendMessage(
        chatId,
        'Welcome! Enter duel command to play with friends',
        InlineKeyboard("duel"),
      );
    } catch (e) {
      console.log('Start cmd exception: ', e);
      bot.sendMessage(chatId, 'Bot-side error');
    }
  };

export const duelHandler = async (msg) => {
  const chatId = msg.chat.id;
  console.log("Duel handler called")

  const linkAuthDataPrev: TelegramAuthData = {
    auth_date: GetDaylyAuthDate(),
    last_name: msg.from.last_name?.replace(' ', '') || '',
    first_name: msg.from.first_name?.replace(' ', ''),
    id: msg.from.id,
    username: msg.from.username?.toLowerCase() || '',
    hash: '',
  };

  if (!msg.from.username) {
    bot.sendMessage(
      chatId,
      'You need to have a visible username to start a duel',
      MarkupKeyboard(),
    );
    return;
  }
  const dateSec = Math.round(new Date().getTime() / 1000);
  const userLastDuel = await GetDuelDataByUser(
    msg.from.username?.toLowerCase(),
  );
  if (!userLastDuel) {
    await CreateDuel(msg.from.username?.toLowerCase(), '');
  } else {
    const isFinished = userLastDuel.isfinished;
    const creation = Number(userLastDuel.creation);
    if (
      !isFinished &&
      dateSec - creation < duel_lifetime &&
      userLastDuel.login1 &&
      userLastDuel.login2
    ) {
      bot.sendMessage(chatId, 'You already in duel, got to Starmap to enter a battle');
      return;
    }
    if (!isFinished || dateSec - creation >= duel_lifetime) {
      console.log('Finish duel case 3');
      await FinishDuel(userLastDuel.duel_id, '');
      const duelId = await CreateDuel(msg.from.username?.toLowerCase(), '');
      console.log('Created, id: ', duelId);
    }
    // console.log('Duel creation, last condition passed 3');
    // await CreateDuel(msg.from.username?.toLowerCase(), '');
  }

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: 'Send invitation',
          switch_inline_query: `Enter a duel with: ${linkAuthDataPrev.username}`,
        },
      ],
    ],
  };

  const deepLink = `${inviteLink}${linkAuthDataPrev.username?.replace(
    ' ',
    '',
  )}`;

  bot.sendMessage(
    chatId,
    `Hello! Forvard this message to invite your friend to a duel:`,
  );

  bot.sendMessage(
    chatId,
    `Hello! Enter a duel with me: <a href="${deepLink}">Link</a>:`,
    {
      parse_mode: 'HTML',
      // reply_markup: JSON.stringify(keyboard),
    },
  );

  bot.sendMessage(chatId, 'Your app url: ', MarkupKeyboard());
};
