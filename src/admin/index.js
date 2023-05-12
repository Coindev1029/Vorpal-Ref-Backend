const { connection } = require('../database/connection')
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

    // const admins_query = "SELECT * FROM users WHERE"

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

