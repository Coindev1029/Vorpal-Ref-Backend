const { connection } = require('../database/connection')
const Web3 = require('web3');
const { sha256 } = require('sha256')

/* In progress */

function GenerateAuthMessage ( msgtext = 'getcontent_' ) {
    const dt = new Date().getTime()
    const timeMark = dt - (dt % 600000)
    const msgstring = msgtext + String(timeMark)
   // console.log(msgstring) 
    const hash = sha256(msgstring)
    return hash;
}

async function RequestAdminData ( request ) {
    const msg = GenerateAuthMessage ()
    const signature = request.signature
    if ( !signature ) {
        return( {
            ok: false,
            error: 'Signature not found',
            content: null
        })
    }

    const web3 = new Web3(config.rpcUrl)
    const request_address = web3.eth.accounts.recover(msg, signature).toLowerCase()

    const admins_query = `SELECT address FROM users WHERE rights = 'admin' AND address = '${request_address}';`;

    const user_query = await connection.query(admins_query);

    console.log(user_query.rows)

    return true
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

