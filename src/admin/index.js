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
    const msgstring = `${msgtext}${String(timeMark)}`
    console.log(msgstring) 
    const hash = sha256(msgstring)
    console.log(hash)
    return String(hash);
}

async function CheckRights ( signature, msgtext = 'getcontent_' ) {

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
            success: false,
            error: 'Signature not found',
            content: null
        })
    }

    const GetDataQuery = `SELECT key, value FROM common_data WHERE key NOT IN (SELECT key FROM keys_not_editable);`
    const KeyData = await connection.query(GetDataQuery)

    return ( {
        success: true,
        error: '',
        content: KeyData.rows
    })
}

async function SaveNewData ( request ) {
    if (!request.data) {
        return(
            {
                success: false,
                error: 'Saving data not found'
            }
        )
    }

    const user = await CheckRights ( request.signature, request.message )
    if ( !user ) {
        return( {
            success: false,
            error: 'Signature not found or invalid',
            content: null
        })
    }

    console.log("data : ")
    console.log(request.data)

    for (let j = 0; j < request.data.length; j++) {
       console.log("Element : ")
       console.log(request.data[j])
       await SetValueByKey(request.data[j]._key, request.data[j].value)
    }
    return( {
        success: true,
        error: '',
        content: request.data
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