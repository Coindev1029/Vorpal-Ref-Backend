const Web3 = require('web3');
const sha256 = require('sha256')
const { config } = require('./config');

const web3 = new Web3(config.rpcUrl)

const msg = 'bf36578e2ddad4f4bd03a2c434bcd84f97e6b70df8577281893ac0dc3b75ddcf'
const signature = '' 

const recover = web3.eth.accounts.recover(msg, signature)

console.log(recover)