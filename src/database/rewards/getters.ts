require('dotenv').config();
import { boxOpenResults } from 'types';
import { connection } from './../connection';
import { WriteLog } from '../../database/log';

const zeroAssets = {
  laser1: 0,
  laser2: 0,
  laser3: 0,
  token: 0,
  spore: 0,
  spice: 0,
  metal: 0,
  biomass: 0,
  carbon: 0
}

export async function GetBoxOpenResult(boxId: number) {
  const logQuery = `SELECT * FROM box_log WHERE id = ${boxId};`;
  const result = await connection.query(logQuery);
  if (result.rows.length === 0) {
    return {
      success: false,
      error: 'Box not open or not exist',
    };
  }
  return {
    success: true,
    data: result.rows[0],
  };
}

export async function GetLoginByAddress(address: string) {}

export async function IsHolderExists (address: string): Promise<Boolean> {
  const selectionQuery = `SELECT * FROM resources WHERE ownerAddress = '${address}' LIMIT 1;`;
  const result = await connection.query(selectionQuery);
  if (result.rows.length === 0) {
    return false;
  } else {
    return true;
  }
}

export async function GetHolderData(address: string) {
  const selectionQuery = `SELECT * FROM resources WHERE ownerAddress = '${address}' LIMIT 1;`;
  const result = await connection.query(selectionQuery);
  if (result.rows.length === 0) {
    return (zeroAssets);
  }
  return result.rows[0];
}

export async function GetBoxOwner(boxId: number) {
  const selectionQuery = `
        SELECT ownerAddress, ownerLogin FROM boxes WHERE id= '${boxId}' LIMIT 1;
      `;
  const result = await connection.query(selectionQuery);
  if (result.rows.length > 0) {
    return result.rows[0];
  } else {
    return ({
      error: "Box with chosen id not found"
    });
  }
}

export async function GetUserBalanceRow(ownerAddress = '', ownerLogin = '') {
  if (!ownerAddress && !ownerLogin) {
    return null;
  }
  const balanceQuery = `
    SELECT laser1, laser2, laser3, token, spore, spice, metal, biomass, carbon 
    FROM resources 
    WHERE ${ownerLogin ? 'ownerLogin' : 'ownerAddress'} = '${
    ownerLogin ? ownerLogin : ownerAddress
  }' LIMIT 1;`;
  const assets = await connection.query(balanceQuery);
  if (assets.rows.length === 0) {
    return (zeroAssets);
  }
  return assets.rows[0];
}

export async function GetAvailableBoxesByOwner(
  ownerAddress = '',
  ownerLogin = '',
) {
  if (!ownerAddress && !ownerLogin) {
    return null;
  }
  const listQuery = `SELECT * FROM boxes WHERE ${
    ownerLogin ? 'ownerLogin' : 'ownerAddress'
  } = '${ownerLogin ? ownerLogin : ownerAddress}' AND isOpen = false;`;
  const response = await connection.query(listQuery);
  return response.rows;
}
