import { Request, Response } from 'express';
import { GetValueByKey } from '../database/balances';
import { GetSignableMessage } from '../utils/auth';
import {
  DeleteDuel,
  FinishDuel,
  GetDuelData,
  GetDuelDataByUser,
  GetDuelPairCount,
  GetOnlineCount,
  GetOpponent,
  IsUserInDuel,
  SetOnlineCount,
} from '../database/telegram/duel';
import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider);

export const IsUserInDuelResponce = async (req: Request, res: Response) => {
  if (!req.params.login) {
    res.status(400).send(
      JSON.stringify({
        error: 'User login is wrong or not specified',
      }),
    );
    return;
  }

  const data = await IsUserInDuel(req.params.login.toLowerCase());
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
  console.log("Duel finish requested")
  const body = req.body;
  if (!body.winner || !body.duelId || !body.signature) {
    res.status(400).send({
      error: 'Some of nessesary parameters is missing',
    });
  }
  const msg = GetSignableMessage();
  const address = web3.eth.accounts.recover(msg, body.signature).toLowerCase();
  const adminAddress = await GetValueByKey('ADMIN_WALLET');
  console.log("Finish duel request received for: ", body.duelId);

  if (address !== adminAddress.toLowerCase()) {
    res.status(403).send({
      error: 'Invalid signature',
    });
    return;
  }

  const result = await FinishDuel(body.duelId, body.winner.toLowerCase());

  res.status(200).send(JSON.stringify({ result: result }));
  return;
};

export const DuelDeletionResponce = async (req: Request, res: Response) => {
  console.log("Duel delete requested")
  const body = req.body;
  if (!body.duelId || !body.signature) {
    res.status(400).send({
      error: 'Some of nessesary parameters is missing',
    });
  }
  const msg = GetSignableMessage();
    const address = web3.eth.accounts.recover(msg, body.signature)
    .toLowerCase();
    const adminAddress = await GetValueByKey("ADMIN_WALLET");
  
    if (address !== adminAddress.toLowerCase()) {
       res.status(403).send({
        error: "Invalid signature",
      });
       return;
    }

    try {

    } catch (e: any) {
      console.log(e.message)
    }

    const result = await DeleteDuel(body.duelId);
    res.status(200).send({
      deleted: result,
    });

}

export const RewardConditionResponce = async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.login1 || !body.login2) {
    res.status(400).send({
      error: 'Some of nessesary parameters is missing',
    });
    return;
  }
  try {
    const duelCount = await GetDuelPairCount(body.login1.toLowerCase(), body.login2.toLowerCase());
    res.status(200).send({
      reward: duelCount <= 1 ? true: false,
    });
  } catch (e) {
    console.log(e.message)
    res.status(501).send({
      error: "Failed to get count"
    });
  }
  return;
}

export const OnlineCountResponce = async (req: Request, res: Response) => {
  try {
    const count = await GetOnlineCount();
    res.status(200).send({
      count
    });
  } catch (e) {
    res.status(501).send({
      error: "Count is not defined"
    });
  }
}

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

  const result = await SetOnlineCount (count);

  res.status(200).send({
    saved: result,
  });
  return;
}
