require('dotenv').config();
import { TelegramAuthData, boxOpenResults } from 'types';
import { connection } from './../connection';
import { WriteLog } from '../../database/log';
import { GetBoxOwner, GetHolderData, GetUserBalanceRow, IsHolderExists } from './getters';
import { GetChannelSubscribeList } from '../../telegram/handlers/subscribe';
import { GetUserInviter } from '../telegram/referral';
import { referralPart1, referralPart2 } from '../../config';

const rewardmessage = "Reward from box";
const rewardrefmessage = "Reward for referral";


export async function CreateNewBox(
  level: number,
  ownerAddress: string = '',
  ownerLogin: string = '',
) {
  const Holer = ownerAddress.toLowerCase();
  console.log('Box creation called for: ', ownerLogin);
  if (!Holer && !ownerLogin) return false;
  const holderData = await IsHolderExists(Holer);
  if (!holderData) {
    await CreateNewHolder(Holer, ownerLogin.toLowerCase());
  }
  const query = `
    INSERT INTO boxes (ownerAddress, ownerLogin, level, isopen) 
    VALUES ('${Holer}', '${ownerLogin.toLowerCase()}', ${level}, false);`;
  console.log('Box creation query: ', query);
  // WriteLog('Box creation query: ', query);
  await connection.query(query);
  const idQuery = `SELECT max(id) FROM boxes;`;
  const info = await connection.query(idQuery);
  return info.rows[0];
}

export async function GiveResources(
  ownerAddress: string = '',
  ownerLogin: string = '',
  resource: string,
  amount: number,
) {
  const Holer = ownerAddress.toLowerCase();
  const holderData = await IsHolderExists(Holer);

  if (!holderData) {
    const creation = await CreateNewHolder(Holer, ownerLogin.toLowerCase());
  }
  const balanceQuery = `UPDATE resources SET ${resource} = ${resource} + ${amount} 
  WHERE ownerAddress = '${Holer}';`;
  await connection.query(balanceQuery);
  return await GetUserBalanceRow(Holer, ownerLogin.toLowerCase());
}

export async function CreateNewHolder(address: string, login?: string) {
  const ownerLogin = (login || address).toLowerCase();
  const isUserExists = await IsHolderExists(address.toLowerCase());
  if (isUserExists) {
    return false;
  }
  const creationQuery = `INSERT INTO resources 
  (ownerAddress, ownerLogin, laser1, laser2, laser3, spore, spice, metal, token, biomass, carbon, trends) 
  VALUES ('${address.toLowerCase()}', '${ownerLogin}', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);`;
  // WriteLog('User creation query: ', creationQuery);
  const result = await connection.query(creationQuery);
  // WriteLog('Insertion result: ', JSON.stringify(result));
  // console.log('Insertion result: ', result)
  return true;
}

export async function UpdateResourceTransaction(
  user: string,
  resource: string,
  amount: number,
  message: string = '',
) {
  const User = user.toLowerCase();
  const time = Math.round(new Date().getTime() / 1000);
  const updateQuery = `UPDATE resources SET ${resource} = ${resource} + ${amount} 
  WHERE ownerAddress = '${User}';`;
  const logQuery = `INSERT INTO "resource_txn_log" 
  ("userlogin", "time", "resource", "amount", "reason")
  VALUES ('${User}', TO_TIMESTAMP(${time}), '${resource}', ${amount}, '${message}');`;
  try {
    await connection.query(updateQuery);
    await connection.query(logQuery);
    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
}

export async function SendRewardsToReferrals (user: string, resource: string, amount: number) {
  const referral1 = await GetUserInviter (user);
  if (!referral1) return([]);
  const referral2 = await GetUserInviter (referral1);
  return Promise.all([
    UpdateResourceTransaction(referral1, resource, amount * referralPart1, rewardrefmessage),
    referral2 ? UpdateResourceTransaction(referral2, resource, amount * referralPart2, rewardrefmessage) : true,
  ])
}

export async function ResourceTransactionWithReferrals (user: string, resource: string, amount: number, message: string = "") {
  return Promise.all([
    UpdateResourceTransaction(user, resource, amount, message),
    SendRewardsToReferrals(user, resource, amount)
  ])
}

export async function OpenBox(boxId: number, telegramData: TelegramAuthData) {
  let openAmount = 0;
  const boxCheckQuery = `SELECT isopen FROM boxes WHERE id = ${boxId};`;
  const check = await connection.query(boxCheckQuery);
  console.log('Box opening started', boxId);
  if (check.rows.length === 0) {
    return {
      success: false,
      error: 'Box id not exist',
    };
  }
  if (check.rows[0].isopen === true || check.rows[0].isopen === 'true') {
    return {
      success: false,
      error: 'Box is already open',
    };
  }
  const owner = await GetBoxOwner(boxId);
  const value = Math.round(Math.random() * 10000);
  const valueVRP = Math.round(Math.random() * 5) + 5;
  await CreateNewHolder(
    telegramData?.username || '',
    telegramData.username || telegramData.first_name,
  );
  if (telegramData) {
    const subscribes = await GetChannelSubscribeList(telegramData.id);
    if (subscribes.length === 0) {
      const trendsValue = 5 + Math.round(Math.random() * 5);
      // const trendsUpQuery = `UPDATE resources SET trends = trends + ${trendsValue} 
      // WHERE ownerAddress IN (SELECT ownerAddress FROM boxes WHERE id = ${boxId})`;
      // await connection.query(trendsUpQuery);
      await  ResourceTransactionWithReferrals (owner, 'trends', trendsValue, rewardmessage);
    }
  }
  await  ResourceTransactionWithReferrals (owner, 'token', valueVRP, rewardmessage);
  // const vrpQuery = `UPDATE resources SET token = token + ${valueVRP} 
  //     WHERE ownerAddress IN (SELECT ownerAddress FROM boxes WHERE id = ${boxId})`;
  // await connection.query(vrpQuery);
  const rewardType: boxOpenResults = (() => {
    switch (true) {
      /* case value < 100:
        openAmount = 1;
        return 'laser3';
      case value < 300:
        openAmount = 1;
        return 'laser2';
      case value < 1000:
        openAmount = 1;
        return 'laser1'; */
      /* case value < 2500:
        openAmount = value % 1000; 
        return 'token'; */
      case value < 2000:
        openAmount = value % 1000;
        return 'spice';
      case value < 4000:
        openAmount = value % 1000;
        return 'spore';
      case value < 6000:
        openAmount = value % 1000;
        return 'metal';
      case value < 8000:
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
  const logQuery = `INSERT INTO box_log (boxId, opening, openResult, openAmount)
    VALUES (${boxId}, CURRENT_TIMESTAMP, '${rewardType}', ${openAmount});`;
  const boxCloseQuery = `UPDATE boxes SET isopen = true WHERE id = ${boxId};`;
  const logs = await connection.query(logQuery);
  await  ResourceTransactionWithReferrals (owner, rewardType, openAmount, rewardmessage);
  await connection.query(boxCloseQuery);
  return {
    success: true,
  };
}
