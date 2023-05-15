const { connection } = require('../database/connection')
const Web3 = require('web3');
const sha256 = require('sha256')
const { WriteLog } = require('./log')
const { config } = require('../config')

/* In progress */

function GenerateAuthMessage ( msgtext = 'getcontent_' ) {
    const dt = new Date().getTime()
    const timeMark = dt - (dt % 600000)
    const msgstring = msgtext + String(timeMark)
   // console.log(msgstring) 
    const hash = sha256(msgstring)
    return hash;
}

async function CheckRights ( signature, msgtext = 'getcontent_' ) {

    if ( !signature ) {
        return null;
    }

    const web3 = new Web3(config.rpcUrl)
    const msg = GenerateAuthMessage ( msgtext )
    const request_address = web3.eth.accounts.recover(msg, signature).toLowerCase()
    
    const admins_query = `SELECT address FROM users WHERE rights = 'admin' AND address = '${request_address}';`;

    const user_query = await connection.query(admins_query);

    if (user_query.rows.length === 0) {
        WriteLog(request_address, "Auth failed")
        return null
    }
    WriteLog(user_query.rows[0].address, "Auth success")
    return user_query.rows[0].address
}

async function RequestAdminData ( request ) {
    const user = await CheckRights ( request.signature )
    if ( !user ) {
        return( {
            ok: false,
            error: 'Signature not found',
            content: null
        })
    }

    return ( {
        ok: true,
        error: '',
        content: null
    })
}


/* 
   body: {
       filter: 'all',
       signature: ''
   }
*/

async function RequestPublicData ( project ) {
    return JSON.stringify({
        project: project
    })
}



module.exports = {
    GenerateAuthMessage,
    RequestAdminData,
    RequestPublicData
  }