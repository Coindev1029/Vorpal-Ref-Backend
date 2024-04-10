require('dotenv').config();
import { boxOpenResults } from 'types';
import { connection } from './../connection';

export async function CreateBox(
  level: number,
  ownerAddress: string = '',
  ownerLogin: string = '',
) {
  if (!ownerAddress && !ownerLogin) return false;
  const query = `
    INSERT INTO boxes (ownerAddress, ownerLogin, level, isOpen) 
    VALUES ('${ownerAddress}', '${ownerLogin}', ${level}, false);`;
  await connection.query(query);
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
    VALUES (${boxId}, to_timestamp(${Math.round(
    new Date().getTime() / 1000,
  )}, '${rewardType}', ${openAmount}));`;
  const balanceQuery = `UPDATE resources SET ${rewardType} = ${rewardType} + ${openAmount}`;
}

export async function GetUserBalanceRow (ownerAddress = "", ownerLogin = "") {
    
}

export async function GetBoxesByOwner() {

}
