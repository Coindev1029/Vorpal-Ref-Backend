const { connection } = require('../database/connection')
const Web3 = require('web3');
const sha256 = require('sha256')
const { WriteLog } = require('./log')
const { config } = require('../config');
const { GenerateAuthMessage, CheckRights } = require('./functions')


const UpdateUserAction = ( request ) => {
    return false
}

const CreateUserAction = ( request ) => {
    return false
}

const DeleteUserAction = ( request ) => {
    return false
}

module.exports = {
    UpdateUserAction,
    CreateUserAction,
    DeleteUserAction
  }