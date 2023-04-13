const { connection } = require('./connection');
const { GetBalances, GetValueByKey } = require('./balances')
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
    
    if ( toWithdraw < 400 ) {
        return ({
            success: false,
            message: "Available amount is too low"
        })
    }

    const refAccount = await GetValueByKey ('referral_public_key')
    const refPrivateKey = await GetValueByKey ('referral_private_key')
    const nonce = await web3.eth.getTransactionCount(account)
    const amount = web3.utils.toWei(String(toWithdraw), 'ether')

    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = await web3.eth.estimateGas({
        from: refAccount,
        to: account,
        value: amount
      });


    console.log(nonce)
    console.log(amount)
    console.log(gasPrice)
    console.log(gasLimit)

    return ({
        success: true,
        message: "Tx data tested"
    })
}

module.exports = {
    WithdrawRevenue
  }