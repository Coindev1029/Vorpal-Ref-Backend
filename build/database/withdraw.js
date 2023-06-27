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
var connection = require('./connection').connection;
var _a = require('./balances'), GetBalances = _a.GetBalances, GetValueByKey = _a.GetValueByKey;
var _b = require('../config'), config = _b.config, Erc20ABI = _b.Erc20ABI;
var Web3 = require('web3');
function WithdrawRevenue(addressTo, signedTX) {
    return __awaiter(this, void 0, void 0, function () {
        var account, time, msg, web3, recover, balances, toWithdraw, refAccount, refPrivateKey, nonce, amount, gasPrice, contract, txData, gasLimit, e_1, txObject, signedTx, txReceipt, e_2, UpdateBalanceQuery;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    account = addressTo.toLowerCase();
                    time = Math.round(new Date().getTime() / 1000);
                    time -= time % 3600;
                    msg = "withdraw_" + time;
                    web3 = new Web3(config.rpcUrl);
                    return [4, web3.eth.accounts.recover(msg, signedTX).toLowerCase()];
                case 1:
                    recover = _a.sent();
                    if (recover !== account) {
                        return [2, ({
                                success: false,
                                message: "Signature is invalid"
                            })];
                    }
                    return [4, GetBalances(account)];
                case 2:
                    balances = _a.sent();
                    toWithdraw = balances.balanceAvailable;
                    if (toWithdraw < 400) {
                        return [2, ({
                                success: false,
                                message: "Available amount is too low"
                            })];
                    }
                    return [4, GetValueByKey('referral_public_key')];
                case 3:
                    refAccount = _a.sent();
                    return [4, GetValueByKey('referral_private_key')];
                case 4:
                    refPrivateKey = _a.sent();
                    return [4, web3.eth.getTransactionCount(refAccount)];
                case 5:
                    nonce = _a.sent();
                    amount = web3.utils.toWei(String(toWithdraw), 'ether');
                    return [4, web3.eth.getGasPrice()];
                case 6:
                    gasPrice = _a.sent();
                    contract = new web3.eth.Contract(Erc20ABI, config.payToken);
                    txData = contract.methods.transfer(account, amount).encodeABI();
                    gasLimit = 0;
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4, web3.eth.estimateGas({
                            from: refAccount,
                            to: config.payToken,
                            value: '0x00',
                            data: txData
                        })];
                case 8:
                    gasLimit = _a.sent();
                    return [3, 10];
                case 9:
                    e_1 = _a.sent();
                    console.log(e_1.message);
                    return [2, ({
                            success: false,
                            message: "Failed to generate a withdraw transaction"
                        })];
                case 10:
                    txObject = {
                        from: refAccount,
                        to: config.payToken,
                        nonce: nonce,
                        gasPrice: web3.utils.toHex(gasPrice),
                        gasLimit: gasLimit,
                        value: '0x00',
                        data: txData
                    };
                    return [4, web3.eth.accounts.signTransaction(txObject, refPrivateKey)];
                case 11:
                    signedTx = _a.sent();
                    _a.label = 12;
                case 12:
                    _a.trys.push([12, 14, , 15]);
                    return [4, web3.eth.sendSignedTransaction(signedTx.rawTransaction)];
                case 13:
                    txReceipt = _a.sent();
                    console.log(txReceipt);
                    return [3, 15];
                case 14:
                    e_2 = _a.sent();
                    console.log(e_2.message);
                    return [2, ({
                            success: false,
                            message: "Failed to sent transaction, your balance is saved"
                        })];
                case 15:
                    UpdateBalanceQuery = "UPDATE balances SET balance_withdrawn = balance_withdrawn+".concat(toWithdraw, " WHERE address = '").concat(account, "';");
                    return [4, connection.query(UpdateBalanceQuery)];
                case 16:
                    _a.sent();
                    return [2, ({
                            success: true,
                            message: "Tx successfull, look at your wallet"
                        })];
            }
        });
    });
}
export { WithdrawRevenue };
//# sourceMappingURL=withdraw.js.map