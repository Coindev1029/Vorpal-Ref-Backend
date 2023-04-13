const { connection } = require('./connection');
const { GetBalances, GetValueByKey } = require('./balances')
const { config, Erc20ABI } = require('../config')
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

    const contract = new web3.eth.contract(Erc20ABI, config.payToken)

    let gasLimit = 0

    try {
        const txObject = {
            from: refAccount,
            to: config.payToken,
            nonce: web3.utils.toHex(nonce),
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: await web3.eth.estimateGas({
                from: refAccount,
                to: account,
                value: amount
              }),
            value: '0x00',
            data: contract.methods.transfer(recipient, amount).encodeABI()
          };
        
    
    } catch (e) {
        return ({
            success: false,
            message: "Failed to generate a withdraw transaction"
        })
    }


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