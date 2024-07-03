import { runQuery as Q } from '../connection'
import { WriteLog }  from '../log';
import Web3 from 'web3';
import sha256 from 'sha256';
import { config } from '../../config';

export function GenerateAuthMessage ( msgtext = 'getcontent_' ) {
    const dt = new Date().getTime()
    const timeMark = dt - (dt % 600000)
    const msgstring = `${msgtext}${String(timeMark)}` 
    const hash = sha256(msgstring)
    console.log(hash)
    return String(hash);
}

export async function CheckRights ( signature, msgtext = 'getcontent_' ) {

    if ( !signature ) {
        return null;
    }

    const web3 = new Web3(config.rpcUrl)
    const msg = GenerateAuthMessage ( msgtext )
    let request_address = ''

    try {
        request_address = web3.eth.accounts.recover(msg, signature).toLowerCase()
    } catch (e) {
        console.log(e)
        return null
    }
    
    const admins_query = `SELECT address FROM users WHERE rights = 'admin' AND address = '${request_address}';`;
    
    const user_query = await Q(admins_query);

    if (!user_query || user_query.length === 0) {
        WriteLog(request_address, "Auth failed")
        return null
    }
    WriteLog(user_query[0].address, "Auth success, msg : " + msgtext)
    return user_query[0].address
}
