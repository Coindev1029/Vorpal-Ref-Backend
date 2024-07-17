import superagent from 'superagent';
import { GetSignableMessage } from '../utils/auth';
import { web3 } from '../controllers';
import { GetValueByKey } from './balances';

export async function NotifyDuelFinishFor(login: string, duelId: string) {
  const key = (await GetValueByKey('ADMIN_KEY')) || '';
  const signature = web3.eth.accounts.sign(GetSignableMessage(), key).signature;
  const url = `${process.env.BATTLE_SERVER_HOST}/api/duelcancel`;
  try {
    const responce =  await superagent.post(url)
    .send({
      signature,
      login,
      duelId
    }).set('Accept', 'application/json')
    .set('Content-Type', 'application/json') 
    .then(response => {
      console.log(response.body); // обработка успешного ответа
      return responce.status === 200 ? true : false;
    })
    .catch(error => {
      console.error('Error:', error); // обработка ошибки
      return false;
    });
    console.log('Result: ', url, responce.status);
    return responce.status === 200 ? true : false;
  } catch (e) {
    console.log(e.message);
    return false;
  }
}
