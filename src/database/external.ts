import axios from 'axios';
import { GetSignableMessage } from '../utils/auth';
import { web3 } from '../responces';
import { GetValueByKey } from './balances';

export async function NotifyDuelFinishFor(login: string) {
  return new Promise(async (resolve, reject) => {
    const key = await GetValueByKey('ADMIN_KEY') || "";
    const signature = web3.eth.accounts.sign(
      GetSignableMessage(),
      key,
    );
    const url = `${process.env.BATTLE_SERVER_HOST}/api/duelcancel`;
    axios
      .post(
        url,
        {
          signature,
          login,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then((res) => {
        console.log("Result: ", url, res.status)
        resolve(res.status === 200 ? true : false);
      });
  });
}
