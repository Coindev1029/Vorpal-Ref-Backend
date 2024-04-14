require('dotenv').config();
import { boxOpenResults } from 'types';
import { connection } from './../connection';
import { WriteLog } from '../../database/log';

export async function CreateNewBox(
  level: number,
  ownerAddress: string = '',
  ownerLogin: string = '',
) {
  if (!ownerAddress && !ownerLogin) return false;
  const holderData = await GetHolderData(ownerAddress);
  if (!holderData) {
    await CreateNewHolder(ownerAddress, ownerLogin);
  }
  const query = `
    INSERT INTO boxes (ownerAddress, ownerLogin, level, isOpen) 
    VALUES ('${ownerAddress}', '${ownerLogin}', ${level}, false);`;
 // WriteLog('Box creation query: ', query);
  await connection.query(query);
  const idQuery = `SELECT max(id) FROM boxes;`;
  const info = await connection.query(idQuery);
  return info.rows[0];
}

export async function GiveResources(ownerAddress: string = '',
ownerLogin: string = '', resource: string, amount: number) {
  const holderData = await GetHolderData(ownerAddress);
  if (!holderData) {
    await CreateNewHolder(ownerAddress, ownerLogin);
  }
  const balanceQuery = `UPDATE resources SET ${resource} = ${resource} + ${amount} 
  WHERE ownerAddress = '${ownerAddress}'`;
  await connection.query(balanceQuery);
  return true;
}

export async function GetHolderData(address: string) {
  const selectionQuery = `SELECT * FROM resources WHERE ownerAddress = '${address}' LIMIT 1;`;
  const result = await connection.query(selectionQuery);
  if (result.rows.length === 0) {
    return null;
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
    return null;
  }
}

export async function GetBoxData() {}

export async function GetLoginByAddress(address: string) {}

export async function GetUserAvailableBoxes(address: string) {}

export async function CreateNewHolder(address: string, login?: string) {
  const userLogin = login || address;
  const isUserExists = await GetHolderData(address);
  if (isUserExists) {
    return false;
  }
  const creationQuery = `INSERT INTO resources (ownerAddress, ownerLogin, laser1, laser2, laser3, spore, spice, metal, token, biomass, carbon) VALUES ('${address}', '${userLogin}', 0, 0, 0, 0, 0, 0, 0, 0, 0);`;
  // WriteLog('User creation query: ', creationQuery);
  const result = await connection.query(creationQuery);
  return true;
}

export async function OpenBox(boxId: number) {
  let openAmount = 0;
  const value = Math.round(Math.random() * 10000);
  const rewardType: boxOpenResults = (() => {
    switch (true) {
      case value < 100:
        openAmount = 1;
        return 'laser3';
      case value < 300:
        openAmount = 1;
        return 'laser2';
      case value < 1000:
        openAmount = 1;
        return 'laser1';
      case value < 2500:
        openAmount = value % 1000;
        return 'token';
      case value < 4000:
        openAmount = value % 1000;
        return 'spice';
      case value < 5500:
        openAmount = value % 1000;
        return 'spore';
      case value < 7000:
        openAmount = value % 1000;
        return 'metal';
      case value < 8500:
        openAmount = value % 1000;
        return 'biomass';
      case value <= 10000:
        openAmount = value % 1000;
        return 'carbon';
      default:
        openAmount = value % 1000;
        return 'token';
    }
  })();
  const logQuery = `INSERT INTO box_log (boxId, opening, openResult)
    VALUES (${boxId}, ${Math.round(
    new Date().getTime() / 1000,
  )}, '${rewardType}');`;
  const balanceQuery = `UPDATE resources SET ${rewardType} = ${rewardType} + ${openAmount} 
  WHERE ownerAddress IN (SELECT ownerAddress FROM boxes WHERE id = ${boxId})`;
  await connection.query(logQuery);
  await connection.query(balanceQuery);
  return true;
}

export async function GetUserBalanceRow(ownerAddress = '', ownerLogin = '') {}

export async function GetBoxesByOwner() {}
