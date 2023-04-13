const { connection } = require('./connection');
const { GetBalances } = require('./balances')
const { config } = require('../config')
const Web3 = require('web3');

async function WithdrawRevenue ( addressTo, signedTX ) {
      
    const account = addressTo.toLowerCase()
    let time = Math.round(new Date().getTime() / 1000)
      time -= time % 3600

    let msg = "withdraw_" + time
    const web3 = new Web3(config.rpcUrl)

    const recover = await web3.eth.accounts.recover(msg, signedTX).toLowerCase()
    console.log(account)
    console.log(recover)
    console.log(String(recover) === String(account))

    if (recover !== account) {
        return ({
            success: false,
            message: "Signature is invalid"
        })
    }

    const balances = await GetBalances(account)

    const toWithdraw = balances.balanceAvailable 

    console.log(toWithdraw)

    return ({
        success: true,
        message: "Tx data tested"
    })
}

module.exports = {
    WithdrawRevenue
  }