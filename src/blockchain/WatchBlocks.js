const Web3 = require('web3')
const { config }= require('./config')
const { GetValueByKey } = require('../database/balances')

const web3 = new Web3(config.rpc); // replace YOUR_PROJECT_ID with your Infura project ID or node URL


/* web3.eth.getBlockNumber().then((res, rej) => {
    console.log(res)
    console.log(rej)
}) */

const myAddr = "0xDD099d768d18E9a6b0bd9DFa02A5FD3A840a273f"
const watchingAddresses = []

for (let key in config.contracts) {
    watchingAddresses.push(config.contracts[key])
}


async function WatchBlocks () {
    
    const startBlock = await GetValueByKey ('last_passed_block')
    const endBlock = await web3.eth.getBlockNumber()
    console.log(watchingAddresses)
    console.log(startBlock)
    console.log(endBlock)
    for (let blk = startBlock; blk < endBlock ; blk++ ) {
        console.log("Block : " + blk)
        try {
            var block = await web3.eth.getBlock(blk);
            // console.log(block)
            if (block && block.transactions) {
                block.transactions.forEach(function(e) {
                    web3.eth.getTransaction(e, (err, result) => {
                        if (err) return;
                        // console.log("result : ")
                        // console.log(result.to)

                        if (watchingAddresses.indexOf(String(result.to))) {
                            console.log("find : ")
                            console.log(e.value.toString(10));
                        }
    
                    })

                });
            }
        } catch (e) { console.error("Error in block " + blk, e); }
    }
}


module.exports = {
    WatchBlocks
  }