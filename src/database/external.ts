import axios from 'axios';
import { GetSignableMessage } from '../utils/auth';
import { web3 } from '../responces';
import { GetValueByKey } from './balances';

export async function NotifyDuelFinishFor(login: string) {
  const key = (await GetValueByKey('ADMIN_KEY')) || '';
  const signature = web3.eth.accounts.sign(GetSignableMessage(), key);
  const url = `${process.env.BATTLE_SERVER_HOST}/api/duelcancel`;
  const responce = await axios.post(
    url,
    JSON.stringify({
      signature,
      login,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  console.log('Result: ', url, responce.status);
  return responce.status === 200 ? true : false;
}
