export const adminLinks = {
   projectInfo: '/api/public/:project',
   requestData: '/api/admin/requestdata',
   saveData: '/api/admin/savedata',
   getUsers: '/api/admin/getusers',
   updateUsers: '/api/admin/updateusers'
}

export const boxLinks = {
   createBox: '/api/boxes/create',
   openDox: '/api/boxes/open',
   gtveResource: '/api/boxes/give',
   getBoxes: '/api/boxes/getavailableboxes/bywallet/:owner',
   getResources: '/api/boxes/getresources/bywallet/:owner',
   getBoxesByLogin: '/api/boxes/getavailableboxes/bylogin/:owner',
   getResourcesByLogin: '/api/boxes/getresources/bylogin/:owner',
}

export const referralLinks = {
   getLinksByOwner: '/api/getlinksbyowner/:id',
   ownerData: '/api/getownerdata/:id',
   withdraw: '/api/withdraw',
   referralUpdate: '/api'
}

export const starsLinks = {
   getAllStars: '/api/getstarlist',
   updateStars: '/api/updatestars',
   updateOneStar: '/api/updateonestar/:id'
}