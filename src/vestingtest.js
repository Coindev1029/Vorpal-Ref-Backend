const { WatchBlocks, WatchContracts } = require('./blockchain/WatchBlocks')
const { 
    FindLinkByReferral, 
    FindLinkOwner,
    GetValueByKey,
    SetValueByKey,
    UpdateScheduledBalance,
    CreateVesting, 
    UpdateVestings } = require('./database/balances')
const Web3 = require('web3')
const { config }= require('./blockchain/config')

// const web3 = new Web3(config.rpc); 

/*
async function UpdateVestingsL () {
    console.log("Vestings : ")
    const queryUnpaidVestings = `SELECT * FROM vestings WHERE value_paid < value_total;`;
    console.log(queryUnpaidVestings )
    const unpaidVestings = await connection.query(queryUnpaidVestings).rows
    const date = new Date().getTime()
    console.log(unpaidVestings)
    if (unpaidVestings.length > 0) {
        unpaidVestings.forEach((vesting) => {
            console.log(vesting)
        })
        return true
    } else {
        return false
    }
} */


console.log("Testing vestings : ")

// WatchBlocks ()

UpdateVestings()
// SetValueByKey ('test', 'ok')
// GetValueByKey ('test')
