var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Web3 = require('web3');
var _a = require('./config'), chainData = _a.chainData, Erc20ABI = _a.Erc20ABI;
var Eth = require('web3-eth').Eth;
var Utils = require('web3-utils').Utils;
var _b = require('../database/balances'), FindLinkByReferral = _b.FindLinkByReferral, FindLinkOwner = _b.FindLinkOwner, GetValueByKey = _b.GetValueByKey, SetValueByKey = _b.SetValueByKey, UpdateScheduledBalance = _b.UpdateScheduledBalance, CreateVesting = _b.CreateVesting;
var web3 = new Web3(chainData.rpc);
var watchingAddresses = [];
var parameterTypes = ['string', 'uint256'];
var wo = chainData.contracts;
for (var key in wo) {
    watchingAddresses.push(wo[key]);
}
function SetupRevenueSingle(tx) {
    return __awaiter(this, void 0, void 0, function () {
        var vPeriod, price, _a, dateStart, dateEnd, tx_data, input_data, buyer, params, valueUSD, link, owner, revenue;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4, GetValueByKey('vesting_period')];
                case 1:
                    vPeriod = _b.sent();
                    _a = Number;
                    return [4, GetValueByKey('VRP_price')];
                case 2:
                    price = _a.apply(void 0, [_b.sent()]);
                    dateStart = Math.round(new Date().getTime() / 1000);
                    dateEnd = dateStart + parseInt(vPeriod);
                    tx_data = tx.input;
                    input_data = '0x' + tx_data.slice(10);
                    buyer = tx.from.toLowerCase();
                    params = web3.eth.abi.decodeParameters(['uint256'], input_data);
                    valueUSD = Math.round(Number(params['0']) / 1e18);
                    return [4, FindLinkByReferral(buyer)];
                case 3:
                    link = _b.sent();
                    if (!link) return [3, 7];
                    return [4, FindLinkOwner(link)];
                case 4:
                    owner = _b.sent();
                    if (!owner) return [3, 7];
                    revenue = valueUSD * 0.05 / price;
                    console.log(revenue);
                    return [4, UpdateScheduledBalance(owner, revenue)];
                case 5:
                    _b.sent();
                    return [4, CreateVesting(owner, revenue, dateStart, dateEnd)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7: return [2];
            }
        });
    });
}
function WatchBlocks() {
    return __awaiter(this, void 0, void 0, function () {
        var startBlock, endBlock, buyings, blk, block, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, GetValueByKey('last_passed_block')];
                case 1:
                    startBlock = _a.sent();
                    return [4, web3.eth.getBlockNumber()];
                case 2:
                    endBlock = _a.sent();
                    buyings = [];
                    console.log(watchingAddresses);
                    console.log(startBlock);
                    console.log(endBlock);
                    blk = startBlock;
                    _a.label = 3;
                case 3:
                    if (!(blk < endBlock)) return [3, 8];
                    console.log("Block : " + blk);
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4, web3.eth.getBlock(blk)];
                case 5:
                    block = _a.sent();
                    if (block && block.transactions) {
                        block.transactions.forEach(function (e) {
                            web3.eth.getTransaction(e, function (err, result) {
                                if (err)
                                    return;
                                if (watchingAddresses.indexOf(String(result.to)) > -1) {
                                    console.log("find : ");
                                    console.log(result);
                                    SetupRevenueSingle(result);
                                }
                            });
                        });
                    }
                    return [3, 7];
                case 6:
                    e_1 = _a.sent();
                    console.error("Error in block " + blk, e_1);
                    return [3, 7];
                case 7:
                    blk++;
                    return [3, 3];
                case 8:
                    SetValueByKey('last_passed_block', endBlock);
                    return [2];
            }
        });
    });
}
function WatchContracts() {
    return __awaiter(this, void 0, void 0, function () {
        var contract, currentBlockNumber, fBlock, transferEvents;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contract = new web3.eth.Contract(Erc20ABI, "0xCDf4F354596e68671dB43AcB64f2da14862e8403");
                    return [4, web3.eth.getBlockNumber()];
                case 1:
                    currentBlockNumber = _a.sent();
                    fBlock = currentBlockNumber - 4000;
                    return [4, contract.getPastEvents("Transfer", {
                            fBlock: fBlock,
                            filter: {
                                isError: 0,
                                txreceipt_status: 1
                            },
                        })];
                case 2:
                    transferEvents = _a.sent();
                    console.log(transferEvents);
                    return [2];
            }
        });
    });
}
export { WatchBlocks, WatchContracts };
//# sourceMappingURL=WatchBlocks.js.map