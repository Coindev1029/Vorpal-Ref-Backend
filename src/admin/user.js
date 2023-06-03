const { WriteLog } = require('./log')
const { CheckRights } = require('./functions')
const { UpdateUser, CreateUser, DeleteUser} = require('../database/users')


/* 
   body: {
       signature: "",
       message: "",
       data: {
         updates: [ {
           address: "",
           login: "",
           rights: ""
         }, {
           address: "",
           login: "",
           rights: ""
         }],
         creations: [ {
           address: "",
           login: "",
           rights: ""
         }, {
           address: "",
           login: "",
           rights: ""
         }],
           deletions: [
            "address",
            "address"
          ]
       }
   }

*/

async function UpdateUserDataAction ( request ) {
    if (!request.data) {
        return(
            {
                success: false,
                error: 'User data not found'
            }
        )
    }
    
    const user = await CheckRights ( request.signature, request.message )
    if ( !user ) {
        return( {
            success: false,
            error: 'Signature not found or invalid'
        })
    }

    const actionResultsUpdate = []
    const actionResultsCreate = []
    const actionResultsDelete = []

    data.updates.forEach((item) => {
        actionResultsUpdate.push(UpdateUser (item))
    })

    data.creations.forEach((item) => {
        actionResultsCreate.push(CreateUser (item))
    })

    data.deletions.forEach((address) => {
        actionResultsDelete.push(DeleteUser (address))
    })
    
    return ({
        updates: actionResultsUpdate,
        creations: actionResultsCreate,
        deletions: actionResultsDelete
    })
}

module.exports = {
    UpdateUserDataAction
  }