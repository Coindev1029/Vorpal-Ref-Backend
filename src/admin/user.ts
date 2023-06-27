const { WriteLog } = require('./log')
const { CheckRights } = require('./functions')
const { UpdateUser, CreateUser, DeleteUser, RequestUsers } = require('../database/users')


/* 
   body: {
       signature: "",
       message: "",
       data: {
         users: [ {
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


export async function RequestUserData ( request ) {

  const user = await CheckRights ( request.signature )
  if ( !user ) {
      return( {
          success: false,
          error: 'Signature not found',
          content: null
      })
  }

  return await RequestUsers ()
}

export async function UpdateUserDataAction ( request ) {

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

    const updates : any[] = []
    const creations : any[] = []

    const actionResultsUpdate : any[]  = []
    const actionResultsCreate : any[] = []
    const actionResultsDelete : any[]  = []

    const currentUsers = JSON.stringify(await RequestUsers())

    request.data.users.forEach((user) => {
         if (currentUsers.indexOf(user.address) < 0) {
            creations.push(user)
         } else {
            updates.push(user)
         }
    })

    updates.forEach((item) => {
        actionResultsUpdate.push(UpdateUser (item))
    })

    creations.forEach((item) => {
        actionResultsCreate.push(CreateUser (item))
    })

    request.data.deletions.forEach((address) => {
        actionResultsDelete.push(DeleteUser (address))
    })
    
    return ({
        updates: actionResultsUpdate,
        creations: actionResultsCreate,
        deletions: actionResultsDelete
    })
}
