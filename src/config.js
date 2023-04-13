const config = {
   networkId: 97,
   connectOptions: {
    keepAlive: true,
    withCredentials: false,
    timeout: 20000, // ms
    headers: [
        {
            name: 'Access-Control-Allow-Origin',
            value: '*'
        }
    ]
  },
  chainName: 'Binance',
  ethSymbol: 'BNB',
  rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  startBlock: 1500000
}

module.exports = {
    config
}

