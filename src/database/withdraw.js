const { connection } = require('./connection');
const { rpcUrl } = require('../config')
const Web3 = require('web3');

async function WithdrawRevenue ( addressTo, signedTX ) {
      
    let time = Math.round(new Date().getTime() / 1000)
      time -= time % 3600

    let msg = "withdraw_" + time

    console.log(rpcUrl)

    const web3 = new Web3(rpcUrl)

    console.log(web3)

    const recover = await web3.eth.personal.ecRecover(msg, signedTX)

    console.log(recover)

    return ({
        success: true,
        message: "Tx data tested"
    })
}

module.exports = {
    WithdrawRevenue
  }