const Web3 = require('web3');
const sha256 = require('sha256')
const { config } = require('./config');

const web3 = new Web3(config.rpcUrl)

const msg = '0df6448e890860f605fcc742e5ede321e6619764c3bc60be1abc964d32ce19ba' 
const signature = '' 

const recover = web3.eth.accounts.recover(msg, signature)

console.log(recover)