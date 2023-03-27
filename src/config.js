const networkId = 97
const connectOptions = {
    keepAlive: true,
    withCredentials: false,
    timeout: 20000, // ms
    headers: [
        {
            name: 'Access-Control-Allow-Origin',
            value: '*'
        }
    ]
  }
const chainName = 'Binance'
const ethSymbol = 'BNB'
const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/"

