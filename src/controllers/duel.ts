import { Request, Response } from 'express';
import { GetValueByKey } from '../models/balances';
import { GetSignableMessage } from '../utils/auth';
import {
  AddDuelOpponent,
  DeleteDuel,
  FinishDuel,
  GetDuelData,
  GetDuelDataByUser,
  GetDuelPairCount,
  GetOnlineCount,
  GetOpponent,
  IsUserInDuel,
  SetOnlineCount,
} from '../models/telegram/duel';
import Web3 from 'web3';
import { UniversalAuth } from './common';
import {
  GetPersonalDataById,
  GetPersonalDataByUsername,
} from '../models/telegram';
import { SendMessageWithSave } from '../telegram/handlers/utils';
import { bot } from '../telegram/bot';
import { messages } from '../telegram/constants';
import { InlineKeyboard } from '../telegram/handlers/keyboard';
import { duel_lifetime } from '../config';

export const web3 = new Web3(Web3.givenProvider);

export const IsUserInDuelResponce = async (req: Request, res: Response) => {
  if (!req.params.login) {
    res.status(400).send(
      JSON.stringify({
        error: 'User login is wrong or not specified',
      }),
    );
    return;
  }

  const data = await IsUserInDuel(String(req.params.login).toLowerCase());
  res.status(200).send(JSON.stringify({ inDuel: data }));
  return;
};

export const OpponentResponce = async (req: Request, res: Response) => {
  if (!req.params.login) {
    res.status(400).send(
      JSON.stringify({
        error: 'User login is wrong or not specified',
      }),
    );
    return;
  }

  const data = await GetOpponent(req.params.login);
  res.status(200).send(JSON.stringify({ opponent: data }));
  return;
};

export const DuelDataResponce = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).send(
      JSON.stringify({
        error: 'Duel id is wrong or not specified',
      }),
    );
    return;
  }

  const data = await GetDuelData(req.params.id);
  res.status(200).send(JSON.stringify({ data: data }));
  return;
};

export const DuelDataByLoginResponce = async (req: Request, res: Response) => {
  if (!req.params.login) {
    res.status(400).send(
      JSON.stringify({
        error: 'Duel login is wrong or not specified',
      }),
    );
    return;
  }

  const data = await GetDuelDataByUser(req.params.login.toLowerCase());
  res.status(200).send(JSON.stringify({ data: data }));
  return;
};

export const FinishDuelResponce = async (req: Request, res: Response) => {
  console.log('Duel finish requested');
  const body = req.body;
  if (!body.duelId || !body.signature) {
    res.status(400).send({
      error: 'Some of nessesary parameters is missing',
    });
  }
  const msg = GetSignableMessage();
  const address = web3.eth.accounts.recover(msg, body.signature).toLowerCase();
  const adminAddress = await GetValueByKey('ADMIN_WALLET');
  console.log('Finish duel request received for: ', body.duelId);

  if (address !== adminAddress.toLowerCase()) {
    res.status(403).send({
      error: 'Invalid signature',
    });
    return;
  }

  const isFinished = (await GetDuelData(body.duelId))?.isfinished;

  if (isFinished) {
    res.status(400).send({
      error: 'Duel already finished',
    });
    return;
  }

  const result = await FinishDuel(
    body.duelId,
    body.winner?.toLowerCase() || '',
  );

  res.status(200).send(JSON.stringify({ result: result }));
  return;
};

export const DuelDeletionResponce = async (req: Request, res: Response) => {
  console.log('Duel delete requested');
  const body = req.body;
  if (!body.duelId || !body.signature) {
    res.status(400).send({
      error: 'Some of nessesary parameters is missing',
    });
  }
  const msg = GetSignableMessage();
  const address = web3.eth.accounts.recover(msg, body.signature).toLowerCase();
  const adminAddress = await GetValueByKey('ADMIN_WALLET');

  if (address !== adminAddress.toLowerCase()) {
    res.status(403).send({
      error: 'Invalid signature',
    });
    return;
  }

  try {
  } catch (e: any) {
    console.log(e.message);
  }

  const result = await DeleteDuel(body.duelId);
  res.status(200).send({
    deleted: result,
  });
};

export const RewardConditionResponce = async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.login1 || !body.login2) {
    res.status(400).send({
      error: 'Some of nessesary parameters is missing',
    });
    return;
  }
  try {
    const duelCount = await GetDuelPairCount(
      body.login1.toLowerCase(),
      body.login2.toLowerCase(),
    );
    res.status(200).send({
      reward: duelCount <= 1 ? true : false,
    });
  } catch (e) {
    console.log(e.message);
    res.status(501).send({
      error: 'Failed to get count',
    });
  }
  return;
};

export const OnlineCountResponce = async (req: Request, res: Response) => {
  try {
    const count = await GetOnlineCount();
    res.status(200).send({
      count,
    });
  } catch (e) {
    res.status(501).send({
      error: 'Count is not defined',
    });
  }
};

export const UpdateOnlineCount = async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.count || !body.signature) {
    res.status(400).send({
      error: 'Some of nessesary parameters is missing',
    });
  }

  const msg = GetSignableMessage();
  const address = web3.eth.accounts.recover(msg, body.signature).toLowerCase();
  const adminAddress = await GetValueByKey('ADMIN_WALLET');

  if (address !== adminAddress.toLowerCase()) {
    res.status(403).send({
      error: 'Invalid signature',
    });
    return;
  }

  const count = Number(body.count);

  if (isNaN(count)) {
    res.status(400).send({
      error: 'Invalid count',
    });
    return;
  }

  const result = await SetOnlineCount(count);

  res.status(200).send({
    saved: result,
  });
  return;
};

export const AcceptDuelResponce = async (req: Request, res: Response) => {
  console.log('Duel accept called');
  const user = await UniversalAuth(req, res);
  console.log(user);
  if (!user) {
    console.log('401');
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }
  if (!req.body.inviter) {
    console.log('400');
    res.status(400).send({ error: 'Duel creator not in the query' });
    return;
  }

  const inviter = req.body.inviter;
  console.log('200');
  try {
    const dateSec = Math.round(new Date().getTime() / 1000);
    const duel = await GetDuelDataByUser(String(inviter));
    if (!duel || duel.isfinished || dateSec - duel.creation > duel_lifetime) {
      res.status(400).send({
        success: false,
        error: 'Duel not found or expired',
      });
      return;
    }
    if (duel.id2 || String(duel.id1) === String(user)) {
      res.status(400).send({
        success: false,
        error: 'Duel is already busy',
      });
      return;
    }
    console.log('Invited user: ', user);
    await AddDuelOpponent(duel.duel_id, user || '');
    const userData = await GetPersonalDataById(Number(user));
    const opponentData = await GetPersonalDataById(Number(inviter));
    console.log('Opponent data: ', opponentData);
    if (opponentData) {
      await SendMessageWithSave(
        bot,
        opponentData.chat_id,
        messages.duelAcceptNotify(
          userData?.username || userData?.first_name || 'Anonimous',
          userData?.username ? true : false,
        ),
        { reply_markup: InlineKeyboard(['duelConfirm']) },
      );
    }
    res.status(200).send({
      success: true,
      error: '',
    });
  } catch (e) {
    console.log(e.message);
    res.status(500).send({ errpr: 'Duel creator not in the query' });
    return;
  }
};
