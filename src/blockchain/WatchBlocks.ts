const Web3 = require('web3')
const { chainData, Erc20ABI }= require('./config')
const { Eth } = require('web3-eth')
const { Utils } = require('web3-utils')

const { 
    FindLinkByReferral, 
    FindLinkOwner,
    GetValueByKey,
    SetValueByKey,
    UpdateScheduledBalance,
    CreateVesting } = require('../database/balances')

const web3 = new Web3(chainData.rpc); 

const watchingAddresses : string[] = []
const parameterTypes = ['string', 'uint256'];
const wo = chainData.contracts

for (let key in wo) {
    watchingAddresses.push(wo[key])
}

async function SetupRevenueSingle ( tx ) {
    let vPeriod = await GetValueByKey ('vesting_period')
    let price = Number(await GetValueByKey ('VRP_price'))
    let dateStart = Math.round(new Date().getTime() / 1000)
    let dateEnd = dateStart + parseInt(vPeriod)

        let tx_data = tx.input;
        let input_data = '0x' + tx_data.slice(10);
        let buyer = tx.from.toLowerCase()

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


export async function WatchBlocks () {
    
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


export async function WatchContracts () {

      const contract = new web3.eth.Contract(Erc20ABI, "0xCDf4F354596e68671dB43AcB64f2da14862e8403");
      const currentBlockNumber = await web3.eth.getBlockNumber();
      const fBlock = currentBlockNumber - 4000;
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
