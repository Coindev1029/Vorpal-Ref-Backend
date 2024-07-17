import Web3 from 'web3';
import sha256 from 'sha256';
import { runQuery as Q  } from '../connection';
import { config } from '../../config';
import { SetValueByKey, DeleteKey } from '../balances';
import { GenerateAuthMessage, CheckRights } from './admin';
import { RequestUserData } from './user';

export async function RequestAdminData ( request ) {
    const user = await CheckRights ( request.signature )
    if ( !user ) {
        return( {
            success: false,
            error: 'Signature not found',
            content: null
        })
    }

    const GetDataQuery = `SELECT key, value FROM common_data WHERE key NOT IN (SELECT key FROM keys_not_editable);`
    const KeyData = await Q(GetDataQuery)

    return ( {
        success: KeyData ? true : false,
        error: KeyData ? '' : 'Unknown',
        content: KeyData || []
    })
}

export async function SaveNewData ( request ) {
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

export async function RequestPublicData ( project ) {
    return JSON.stringify({
        project: project
    })
}
