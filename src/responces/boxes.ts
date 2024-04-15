import { CreateNewBox, GetUserBalanceRow, OpenBox } from '../database/rewards';
import { GetValueByKey } from '../database/balances';
import { error } from 'console';
const express = require('express');
const bodyParser = require('body-parser');

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

export const CreateBox = async (req, res) => {
  const body = req.body;
  if (!body.level ||!body.ownerAddress || !body.ownerLogin || !body.signature) {
    res.status(400).send({
      error: "Some of nessesary parameters is missing"
   })
  }
  try {
    // const isHolderCreated = await CreateNewHolder(body.ownerAddress)
    const boxId = await CreateNewBox(body.level, body.ownerAddress, body.ownerLogin);
    res.status(200).send({
      box: boxId.max
   })
  } catch (e) {
    res.status(400).send({
      error: String(e.message)
   })
  }
};

export const OpenBoxRequest = async (req, res) => {
  const body = req.body;
    if (!body.boxId || !body.signature) {
      res.status(400).send({
        error: "Some of nessesary parameters is missing"
     })
    }
  try {
    const openingResult = await OpenBox(body.boxId);
    res.status(200).send({
      ok: openingResult
   })
  } catch (e) {
    res.status(400).send({
      error: String(e.message)
   })
  }
}


export const GiveResources = async (req, res) => {
    res.send({ok: 'ok'})
}

export const GetUserBoxes = async (req, res) => {
    res.send({ok: 'ok'})
}

export const GetUserResources = async (req, res) => {
  const body = req.body;
  if (!body.userAddress && !body.userLogin) {
    res.status(400).send({
      error: "Nessesary parameters is missing"
   })
  }
  try {
    const assets = await GetUserBalanceRow(body.userAddress || '0x00', body.userLogin || '');
    res.status(200).send({
      assets: assets
   })
  } catch (e) {
    res.status(400).send({
      error: String(e.message)
   })
  }
    res.send({ok: 'ok'})
}

