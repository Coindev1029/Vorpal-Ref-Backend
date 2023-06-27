import { WatchBlocks } from './blockchain/WatchBlocks';
var _a = require('./database/balances'), FindLinkByReferral = _a.FindLinkByReferral, FindLinkOwner = _a.FindLinkOwner, GetValueByKey = _a.GetValueByKey, SetValueByKey = _a.SetValueByKey, UpdateScheduledBalance = _a.UpdateScheduledBalance, CreateVesting = _a.CreateVesting, UpdateVestings = _a.UpdateVestings;
var Web3 = require('web3');
var config = require('./blockchain/config').config;
console.log("Testing blocks : ");
WatchBlocks();
//# sourceMappingURL=blocktest.js.map