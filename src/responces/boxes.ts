import { CreateNewBox } from '../database/rewards';
import { GetValueByKey } from '../database/balances';
import { error } from 'console';
const express = require('express');
// const bodyParser = require('body-parser');

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
  // const CreateNewHolderQuery = `INSERT INTO resources (ownerAddress, ownerLogin, laser1, laser2, laser3, spore, spice, metal, token, biomass, carbon) VALUES ('${body.ownerAddress}', '${body.ownerLogin}', 0, 0, 0, 0, 0, 0, 0, 0, 0);`;
  try {
    res.status(200).send({
      request: String(req)
   })
  } catch (e) {
    res.status(400).send({
      error: String(e.message)
   })
  }
  /* const boxId = await CreateNewBox(body.level, body.ownerAddress, body.ownerLogin);
  res.status(200).send({
    box: boxId
  }) */
};

export const GiveResources = async (req, res) => {
    res.send({ok: 'ok'})
}

export const OpenBox = async (req, res) => {
    res.send({ok: 'ok'})
}

export const GetUserBoxes = async (req, res) => {
    res.send({ok: 'ok'})
}

export const GetUserResources = async (req, res) => {
    res.send({ok: 'ok'})
}

