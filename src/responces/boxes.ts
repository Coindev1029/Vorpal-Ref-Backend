import { Request, Response } from 'express';
import {
  CreateNewBox,
  GetAvailableBoxesByOwner,
  GetBoxOpenResult,
  GetBoxOwner,
  GetUserBalanceRow,
  GiveResources,
  OpenBox,
} from '../database/rewards';
import { GetValueByKey } from '../database/balances';
import { error } from 'console';
import { CheckTelegramAuth, GetSignableMessage } from '../utils/auth';
import Web3 from 'web3';
const express = require('express');
const bodyParser = require('body-parser');

const web3 = new Web3(Web3.givenProvider);

const AuthMsg = (): string => {
  const dt = new Date().getTime();
  return 'auth_' + String(dt - (dt % 600000));
};

let adminWallet = '';

GetValueByKey('ADMIN_WALLET').then((value) => {
  adminWallet = value.toLowerCase();
});

/* 
  {
    level: number,
    ownerAddress: string,
    ownerLogin?: string
    signature: string
  }
*/

export const CreateBox = async (req: Request, res: Response) => {
  const body = req.body;
  if (
    !body.level ||
    !body.ownerAddress ||
    !body.ownerLogin ||
    !body.signature
  ) {
    res.status(400).send({
      error: 'Some of nessesary parameters is missing',
    });
  }
  console.log("Box creation request: ", req.body)
  try {
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
  } catch (e) {
    res.status(400).send({ error: "Wrong signature"});
    return;
  }

  try {
    // const isHolderCreated = await CreateNewHolder(body.ownerAddress)
    const boxId = await CreateNewBox(
      body.level,
      body.ownerAddress.toLowerCase(),
      body.ownerLogin,
    );
    res.status(200).send({
      box: boxId.max,
    });
  } catch (e) {
    res.status(400).send({
      error: String(e.message),
    });
  }
};

export const OpenBoxRequest = async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.boxId || (!body.signature && !body.telegramData)) {
    res.status(400).send({
      error: 'Some of nessesary parameters is missing',
    });
  }
  console.log("Box opening requested", body.boxId, body.telegramData, body.signature)
  try {
    const msg = GetSignableMessage();
    const address = body.signature ? web3.eth.accounts.recover(msg, body.signature)
    .toLowerCase() : "";
    const adminAddress = await GetValueByKey("ADMIN_WALLET");
    const boxOwner = await GetBoxOwner(body.boxId);

    if (!boxOwner) {
      res.status(400).send({
        error: "Invalid box id",
      });
    }

    const telegramDataValidation = body.telegramData? CheckTelegramAuth(body.telegramData).success : null;
  
    if (address !== adminAddress.toLowerCase() 
      && address !== boxOwner.toLowerCase() &&
    !telegramDataValidation) {
      res.status(403).send({
        error: "Caller have no rights to open",
      });
       return;
    }
  } catch (e) {
    res.status(400).send({ error: "Wrong signature"});
    return;
  }

  try {
    const openingResult = await OpenBox(body.boxId, body.telegramData || undefined);
    res.status(200).send({
      ok: openingResult,
    });
  } catch (e) {
    res.status(400).send({
      error: String(e.message),
    });
  }
};

export const GiveResourcesResponce = async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.signature) {
    res.status(400).send({
      error: 'Message must be sgned by admin',
    });
  }
  if (!body.ownerAddress && !body.ownerLogin) {
    res.status(400).send({
      error: 'Nessesary user parameters is missing',
    });
  }
  if (!body.resource || !body.amount) {
    res.status(400).send({
      error: 'Resource parameters is missing',
    });
  }
  try {
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
  } catch (e) {
    res.status(400).send({ error: "Wrong signature"});
    return;
  }

  const result = await GiveResources(
    body.ownerAddress?.toLowerCase() || '',
    body.ownerLogin || '',
    body.resource,
    body.amount,
  );

  res.status(200).send(result);
};

export const GetUserBoxes = async (req: Request, res: Response) => {
  res.send({ ok: 'ok' });
};

export const GetUserResources = async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.ownerAddress && !body.ownerLogin) {
    res.status(400).send({
      error: 'Nessesary parameters is missing',
    });
    return;
  }
  try {
    const assets = await GetUserBalanceRow(
      body.ownerAddress?.toLowerCase() || '0x00',
      body.ownerLogin || '',
    );
    res.status(200).send({
      assets: assets,
    });
  } catch (e) {
    res.status(400).send({
      error: String(e.message),
    });
  }
  // res.send({ ok: 'ok' });
};

export const GetUserAvailableBoxes = async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.ownerAddress && !body.ownerLogin) {
    res.status(400).send({
      error: 'Nessesary parameters is missing',
    });
  }
  const result = await GetAvailableBoxesByOwner (body.ownerAddress?.toLowerCase() || '',
  body.ownerLogin || '')
  res.status(200).send(result)

}

export const GetBoxOpenResultResponce = async (req: Request, res: Response) => {
  const body = req.body;

  if (!body.boxId) {
    res.status(400).send({
      error: 'Nessesary parameters is missing',
    });
  }

  const result = await GetBoxOpenResult (body.boxId);
  res.status(200).send(result)
}
