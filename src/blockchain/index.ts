import Web3 from 'web3'
const chainData = require('./config')

const web3 = new Web3(chainData.rpc); // replace YOUR_PROJECT_ID with your Infura project ID or node URL


/* web3.eth.getBlockNumber().then((res, rej) => {
    console.log(res)
    console.log(rej)
}) */

const watchingAddresses : string[] = []

for (let key in chainData.contracts) {
    watchingAddresses.push(chainData.contracts[key])
}