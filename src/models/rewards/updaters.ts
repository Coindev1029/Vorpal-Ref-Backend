require('dotenv').config();
import { TelegramAuthData, boxOpenResults } from 'types';
import { pool } from '../connection';
import { WriteLog } from '../log';
import { GetBoxOwner, GetHolderData, GetUserBalanceRow, IsHolderExists } from './getters';
import { GetChannelSubscribeList } from '../../telegram/handlers/subscribe';
import { GetUserInviter, GetUserInviterById, WriteReferralStats } from '../telegram/referral';
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
    await createNewHolder(Holer, ownerLogin.toLowerCase());
  }
  const query = `
    INSERT INTO boxes (ownerAddress, ownerLogin, level, isopen) 
    VALUES ('${Holer}', '${ownerLogin.toLowerCase()}', ${level}, false);`;
  console.log('Box creation query: ', query);
  // WriteLog('Box creation query: ', query);
  await pool.query(query);
  const idQuery = `SELECT max(id) FROM boxes;`;
  const info = await pool.query(idQuery);
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
    const creation = await createNewHolder(Holer, ownerLogin.toLowerCase());
  }
  const balanceQuery = `UPDATE resources SET ${resource} = ${resource} + ${amount} 
  WHERE ownerAddress = '${Holer}';`;
  await pool.query(balanceQuery);
  return await GetUserBalanceRow(Holer, ownerLogin.toLowerCase());
}

export async function createNewHolder(address: string, login?: string) {
  const ownerLogin = (login || address).toLowerCase();
  const isUserExists = await IsHolderExists(address.toLowerCase());
  if (isUserExists) {
    return false;
  }
  const creationQuery = `INSERT INTO resources 
  (ownerAddress, ownerLogin, laser1, laser2, laser3, spore, spice, metal, token, biomass, carbon, trends) 
  VALUES ('${address.toLowerCase()}', '${ownerLogin}', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);`;
  // WriteLog('User creation query: ', creationQuery);
  const result = await pool.query(creationQuery);
  // WriteLog('Insertion result: ', JSON.stringify(result));
  // console.log('Insertion result: ', result)
  return true;
}

export async function updateResourceTransaction(
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
    await pool.query(updateQuery);
    await pool.query(logQuery);
    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
}

export async function sendRewardsToReferrals (user: string, resource: string, amount: number) {
  const referral1 = await GetUserInviterById (user);
  if (!referral1) return([]);
  const referral2 = await GetUserInviterById (referral1);
  await WriteReferralStats ({ to: referral1, for: user, resource, amount: amount * referralPart1, level: 1 })
  if (referral2) {
    await WriteReferralStats ({ to: referral2, for: user, resource, amount: amount * referralPart1, level: 2 })
  }
  return Promise.all([
    updateResourceTransaction(referral1, resource, amount * referralPart1, rewardrefmessage),
    referral2 ? updateResourceTransaction(referral2, resource, amount * referralPart2, rewardrefmessage) : true,
  ])
}

export async function resourceTransactionWithReferrals (user: string, resource: string, amount: number, message: string = "") {
  return Promise.all([
    updateResourceTransaction(user, resource, amount, message),
    sendRewardsToReferrals(user, resource, amount)
  ])
}

export async function openBox(boxId: number, telegramData: TelegramAuthData) {
  let openAmount = 0;
  const boxCheckQuery = `SELECT isopen FROM boxes WHERE id = ${boxId};`;
  const check = await pool.query(boxCheckQuery);
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
  await createNewHolder(
    String(telegramData?.id || ''),
    String(telegramData.username || telegramData.first_name),
  );
  if (telegramData) {
    const subscribes = await GetChannelSubscribeList(telegramData.id);
    if (subscribes.length === 0) {
      const trendsValue = 5 + Math.round(Math.random() * 5);
      // const trendsUpQuery = `UPDATE resources SET trends = trends + ${trendsValue} 
      // WHERE ownerAddress IN (SELECT ownerAddress FROM boxes WHERE id = ${boxId})`;
      // await connection.query(trendsUpQuery);
      await  resourceTransactionWithReferrals (owner, 'trends', trendsValue, rewardmessage);
    }
  }
  await  resourceTransactionWithReferrals (owner, 'token', valueVRP, rewardmessage);
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
  const logs = await pool.query(logQuery);
  await  resourceTransactionWithReferrals (owner, rewardType, openAmount, rewardmessage);
  await pool.query(boxCloseQuery);
  return {
    success: true,
  };
}
