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
    const nonce = await web3.eth.getTransactionCount(refAccount)
    const amount = web3.utils.toWei(String(toWithdraw), 'ether')

    const gasPrice = await web3.eth.getGasPrice();

    const contract = new web3.eth.Contract(Erc20ABI, config.payToken)
    const txData = contract.methods.transfer(account, amount).encodeABI()

    let gasLimit = 0

    try {

        gasLimit = await web3.eth.estimateGas({
            from: refAccount,
            to: config.payToken,
            value: '0x00',
            data: txData
          })
        
    
    } catch (e) {
        console.log(e.message)
        return ({
            success: false,
            message: "Failed to generate a withdraw transaction"
        })
    }

    const txObject = {
        from: refAccount,
        to: config.payToken,
        nonce: nonce,
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: gasLimit,
        value: '0x00',
        data: txData
      };

    const signedTx = await web3.eth.accounts.signTransaction(txObject, refPrivateKey);


    try {
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log(txReceipt)


    } catch (e) {
        console.log(e.message)
        
        return ({
            success: false,
            message: "Failed to sent transaction, your balance is saved"
        })
    }

    const UpdateBalanceQuery = `UPDATE balances SET balance_withdrawn = balance_withdrawn+${toWithdraw} WHERE address = '${account}';`
    await connection.query(UpdateBalanceQuery)

    return(
        {
            success: true,
            message: "Tx successfull, look at your wallet"
        }
    )
}

module.exports = {
    WithdrawRevenue
  }