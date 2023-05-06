const Web3 = require('web3')
const { config, Erc20ABI }= require('./config')
const { Eth } = require('web3-eth')
const { Utils } = require('web3-utils')
const { 
    FindLinkByReferral, 
    FindLinkOwner,
    GetValueByKey,
    SetValueByKey,
    UpdateScheduledBalance,
    CreateVesting } = require('../database/balances')

const web3 = new Web3(config.rpc); 

/* 

MethodID: 0x3610724e
[0]:  00000000000000000000000000000000000000000000001043561a8829300000

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
 */

const myAddr = "0xDD099d768d18E9a6b0bd9DFa02A5FD3A840a273f"
const watchingAddresses = []
const parameterTypes = ['string', 'uint256'];

for (let key in config.contracts) {
    watchingAddresses.push(config.contracts[key])
}

async function SetupRevenueSingle ( tx ) {
    let vPeriod = await GetValueByKey ('vesting_period')
    let price = Number(await GetValueByKey ('VRP_price'))
    let dateStart = Math.round(new Date().getTime() / 1000)
    let dateEnd = parseInt(dateStart) + parseInt(vPeriod)

        let tx_data = tx.input;
        let input_data = '0x' + tx_data.slice(10);
        buyer = tx.from.toLowerCase()

        let params = web3.eth.abi.decodeParameters(['uint256'], input_data);
        let valueUSD = Math.round(Number(params['0']) / 1e18)

        const link = await FindLinkByReferral(buyer)

        if (link) {
            const owner = await FindLinkOwner(link)
            if (owner) {
                const revenue = valueUSD * 0.05 / price
                console.log(revenue)
                await UpdateScheduledBalance(owner, revenue)
                await CreateVesting(owner, revenue, dateStart, dateEnd)
            }
        }
}


async function WatchBlocks () {
    
    const startBlock = await GetValueByKey ('last_passed_block')
    const endBlock = await web3.eth.getBlockNumber()
    const buyings = []
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

                        if (watchingAddresses.indexOf(String(result.to)) > -1) {
                            console.log("find : ")
                            console.log(result);
                            SetupRevenueSingle ( result ) 
                        }

                    })

                });
            }
        } catch (e) { console.error("Error in block " + blk, e); }
    }

    SetValueByKey ('last_passed_block', endBlock)
}


async function WatchContracts () {

      const contract = new web3.eth.Contract(Erc20ABI, "0xCDf4F354596e68671dB43AcB64f2da14862e8403");
      const currentBlockNumber = await web3.eth.getBlockNumber();
      fBlock = currentBlockNumber - 4000;
      const transferEvents = await contract.getPastEvents("Transfer", {
        fBlock,
        filter: {
          isError: 0,
          txreceipt_status: 1
        },
        /* topics: [
          Utils.sha3("Transfer(address,address,uint256)"),
          null,
          Utils.padLeft(address, 64)
        ] */
      });

      console.log(transferEvents)
    

    /* for (let index = 0; index < watchingAddresses.length; index++) {
       
    } */
}


module.exports = {
    WatchBlocks,
    WatchContracts
  }