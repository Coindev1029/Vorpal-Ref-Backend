const Web3 = require('web3')
const config = require('./config')

const web3 = new Web3(config.rpc); // replace YOUR_PROJECT_ID with your Infura project ID or node URL


/* web3.eth.getBlockNumber().then((res, rej) => {
    console.log(res)
    console.log(rej)
}) */

const myAddr = "0xDD099d768d18E9a6b0bd9DFa02A5FD3A840a273f"
const watchingAddresses = []

for (let key in config.config.contracts) {
    watchingAddresses.push(config.config.contracts[key])
}