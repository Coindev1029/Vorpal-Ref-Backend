const { connection } = require('./connection');

async function WithdrawRevenue ( addressTo, signedTX ) {
    console.log(addressTo)
    console.log(signedTX)
    return ({
        success: true,
        message: "Tx data tested"
    })
}

module.exports = {
    WithdrawRevenue
  }