import Web3 from 'web3';
var chainData = require('./config');
var web3 = new Web3(chainData.rpc);
var watchingAddresses = [];
for (var key in chainData.contracts) {
    watchingAddresses.push(chainData.contracts[key]);
}
//# sourceMappingURL=index.js.map