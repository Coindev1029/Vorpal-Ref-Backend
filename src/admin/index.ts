const { connection } = require('../database/connection')
const Web3 = require('web3');
const sha256 = require('sha256')
const { WriteLog } = require('./log')
const { config } = require('../config');
const { SetValueByKey, DeleteKey } = require('../database/balances');
const { GenerateAuthMessage, CheckRights } = require('./functions')
const { RequestUserData } = require('./user')

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

    for (let j = 0; j < request.data.length; j++) {

       await SetValueByKey(request.data[j]._key, request.data[j].value)
    }
    
    if (request.deletions && request.deletions.length > 0) {
        for (let k = 0; k < request.deletions.length; k++) {
            await DeleteKey (request.deletions[k])
        }
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



export {
    GenerateAuthMessage,
    RequestAdminData,
    RequestUserData,
    SaveNewData,
    RequestPublicData
  }