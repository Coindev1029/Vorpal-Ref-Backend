const Web3 = require('web3')
const { config }= require('./config')

const web3 = new Web3(config.rpc); // replace YOUR_PROJECT_ID with your Infura project ID or node URL


/* web3.eth.getBlockNumber().then((res, rej) => {
    console.log(res)
    console.log(rej)
}) */

const myAddr = "0xDD099d768d18E9a6b0bd9DFa02A5FD3A840a273f"

async function WatchBlocks () {
    for (let blk = 28673285; blk < 28153458 ; blk++ ) {
        console.log("Block : " + blk)
        try {
            var block = await web3.eth.getBlock(blk);
            // console.log(block)
            if (block && block.transactions) {
                block.transactions.forEach(function(e) {
                    web3.eth.getTransaction(e, (err, result) => {
                        if (err) return;
                        console.log("result : ")
                        console.log(result.to)

                        if (String(myAddr) === String(result.from) || String(myAddr) === String(result.to)) {
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