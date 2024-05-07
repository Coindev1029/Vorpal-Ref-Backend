import { GetValueByKey } from '../database/balances';
import { GetSignableMessage } from '../utils/auth';
import {
  FinishDuel,
  GetDuelData,
  GetDuelDataByUser,
  GetOpponent,
  IsUserInDuel,
} from '../database/duel';
import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider);

export const IsUserInDuelResponce = async (req, res) => {
  if (!req.params.login) {
    res.status(400).send(
      JSON.stringify({
        error: 'User login is wrong or not specified',
      }),
    );
    return;
  }

  const data = await IsUserInDuel(req.params.login);
  res.status(200).send(JSON.stringify({ inDuel: data }));
  return;
};

export const OpponentResponce = async (req, res) => {
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

export const DuelDataResponce = async (req, res) => {
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

export const DuelDataByLoginResponce = async (req, res) => {
  if (!req.params.login) {
    res.status(400).send(
      JSON.stringify({
        error: 'Duel login is wrong or not specified',
      }),
    );
    return;
  }

  const data = await GetDuelDataByUser(req.params.login);
  res.status(200).send(JSON.stringify({ data: data }));
  return;
};

export const FinishDuelResponce = async (req, res) => {
  const body = req.body;
  if (!body.winner || !body.duelId || !body.signature) {
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

  const result = await FinishDuel(body.duelId, body.winner);

  res.status(200).send(JSON.stringify({ result: result }));
  return;
};
