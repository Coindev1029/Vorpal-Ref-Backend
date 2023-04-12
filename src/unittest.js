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

const buyings = [
    {
        blockHash: '0x5705e6f61dc44f53ba07fae072fb3312ec05c83345a2b9533969cefe68a31f34',
        blockNumber: 28673700,
        from: '0x0779ffA4EA4B23260065ddcB10f4d88Be9E29a32',
        gas: 225954,
        gasPrice: '10000000000',
        hash: '0x8c83fa2018957127ea0d073c19572d395386fb4b9d18de53c12e42d3163df871',
        input: '0x3610724e00000000000000000000000000000000000000000000001043561a8829300000',
        nonce: 40,
        to: '0x30aEF32c9590B060D43877eD19047E58cC75015b',
        transactionIndex: 12,
        value: '0',
        type: 0,
        v: '0xe6',
        r: '0xc499e107fd686dac44943e9030e2990972b7966e7bde1a806f81ef2e41a511fb',
        s: '0x32e67cf2204fa8e997d32ae379ad401aeb3c6719edd0509662c5ca02a5ccb01b'
      }
]

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
// WatchBlocks ()

console.log("Test vestings : ")
// UpdateVestings()
SetValueByKey ('test', 'ok')
GetValueByKey ('test')

// console.log(UpdateVestings)
console.log("Test vestings finished ")