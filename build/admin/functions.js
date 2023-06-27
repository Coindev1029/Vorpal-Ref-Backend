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
import { connection } from '../database/connection';
var Web3 = require('web3');
var sha256 = require('sha256');
var WriteLog = require('./log').WriteLog;
var config = require('../config').config;
function GenerateAuthMessage(msgtext) {
    if (msgtext === void 0) { msgtext = 'getcontent_'; }
    var dt = new Date().getTime();
    var timeMark = dt - (dt % 600000);
    var msgstring = "".concat(msgtext).concat(String(timeMark));
    var hash = sha256(msgstring);
    console.log(hash);
    return String(hash);
}
function CheckRights(signature, msgtext) {
    if (msgtext === void 0) { msgtext = 'getcontent_'; }
    return __awaiter(this, void 0, void 0, function () {
        var web3, msg, request_address, admins_query, user_query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!signature) {
                        return [2, null];
                    }
                    web3 = new Web3(config.rpcUrl);
                    msg = GenerateAuthMessage(msgtext);
                    request_address = '';
                    try {
                        request_address = web3.eth.accounts.recover(msg, signature).toLowerCase();
                    }
                    catch (e) {
                        console.log(e);
                        return [2, null];
                    }
                    admins_query = "SELECT address FROM users WHERE rights = 'admin' AND address = '".concat(request_address, "';");
                    return [4, connection.query(admins_query)];
                case 1:
                    user_query = _a.sent();
                    if (user_query.rows.length === 0) {
                        WriteLog(request_address, "Auth failed");
                        return [2, null];
                    }
                    WriteLog(user_query.rows[0].address, "Auth success, msg : " + msgtext);
                    return [2, user_query.rows[0].address];
            }
        });
    });
}
export { GenerateAuthMessage, CheckRights };
//# sourceMappingURL=functions.js.map