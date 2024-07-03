require('dotenv').config();
import { boxOpenResults } from 'types';
import { Q, pool } from './../connection';
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
  carbon: 0,
  trends: 0
}

export async function GetBoxOpenResult(boxId: number) {
  const logQuery = `SELECT * FROM box_log WHERE id = ${boxId};`;
  const result = await Q(logQuery);
  if (!result|| result.length === 0) {
    return {
      success: false,
      error: 'Box not open or not exist',
    };
  }
  return {
    success: true,
    data: result,
  };
}

export async function GetLoginByAddress(address: string) {}

export async function IsHolderExists (address: string): Promise<Boolean> {
  const selectionQuery = `SELECT * FROM resources WHERE ownerAddress = '${address.toLowerCase()}' LIMIT 1;`;
  const result = await Q(selectionQuery);
  if (!result || result.length === 0) {
    return false;
  } else {
    return true;
  }
}

export async function GetHolderData(address: string) {
  const selectionQuery = `SELECT * FROM resources WHERE ownerAddress = '${address.toLowerCase()}' LIMIT 1;`;
  const result = await Q(selectionQuery);
  if (!result || result.length === 0) {
    return (zeroAssets);
  }
  return result[0];
}

export async function GetBoxOwner(boxId: number): Promise<string> {
  const selectionQuery = `
        SELECT ownerAddress, ownerLogin FROM boxes WHERE id= '${boxId}' LIMIT 1;
      `;
  const result = await Q(selectionQuery);
  if (result && result.length > 0) {
    return result[0].ownerlogin || result[0].owneraddress;
  } else {
    return "";
  }
}

export async function GetUserBalanceRow(ownerAddress = '', ownerLogin = '') {
  if (!ownerAddress && !ownerLogin) {
    return null;
  }
  const balanceQuery = `
    SELECT laser1, laser2, laser3, token, spore, spice, metal, biomass, carbon, trends 
    FROM resources 
    WHERE ${ownerLogin ? 'ownerLogin' : 'ownerAddress'} = '${
    (ownerLogin ? ownerLogin : ownerAddress).toLowerCase()
  }' LIMIT 1;`;
  const assets = await Q(balanceQuery);
  if (!assets || assets.length === 0) {
    return (zeroAssets);
  }
  return assets[0];
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
  } = '${(ownerLogin ? ownerLogin : ownerAddress).toLowerCase()}' AND isOpen = false;`;
  const response = await Q(listQuery);
  return response || [];
}
