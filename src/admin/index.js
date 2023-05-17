const { connection } = require('../database/connection')
const Web3 = require('web3');
const sha256 = require('sha256')
const { WriteLog } = require('./log')
const { config } = require('../config');
const { SetValueByKey } = require('../database/balances');

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
    WriteLog(user_query.rows[0].address, "Auth success, msg : " + msgtext)
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

    const GetDataQuery = `SELECT key, value FROM common_data WHERE key NOT IN (SELECT key FROM keys_not_editable);`
    const KeyData = await connection.query(GetDataQuery)

    return ( {
        ok: true,
        error: '',
        content: KeyData.rows
    })
}

async function SaveNewData ( request ) {
    if (!request.data) {
        return(
            {
                ok: false,
                error: 'Saving data not found'
            }
        )
    }
    let signedData =''
    try {
        signedData = JSON.stringify(request.data)
    } catch (e) {
        return(
            {
                ok: false,
                error: 'Saving data is invalid'
            }
        )
    }
    const user = await CheckRights ( request.signature, signedData )
    if ( !user ) {
        return( {
            ok: false,
            error: 'Signature not found or invalid',
            content: null
        })
    }

    for (let key in response.data) {
        await SetValueByKey(key, response.data[key])
    }
    return( {
        ok: true,
        error: '',
        content: response.data
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
    SaveNewData,
    RequestPublicData
  }