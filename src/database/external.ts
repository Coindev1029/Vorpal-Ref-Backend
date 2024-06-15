import axios from 'axios';
import { GetSignableMessage } from '../utils/auth';
import { web3 } from '../responces';

export async function NotifyDuelFinishFor(login: string) {
  return new Promise(async (resolve, reject) => {
    const signature = web3.eth.accounts.sign(
      GetSignableMessage(),
      process.env.ADMIN_PRIVATE_KEY || '',
    );
    const url = `${process.env.BATTLE_SERVER_HOST}/api/duelcancelled`;
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
        console.log(res);
        resolve(res.status === 200 ? true : false);
      });
  });
}
