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
require('dotenv').config();
import { connection } from './connection';
var migrate = require("postgres-migrations").migrate;
var Web3 = require('web3');
var config = require('../blockchain/config');
var nessesary_keys = require('../config').nessesary_keys;
var _a = require('./balances'), GetValueByKey = _a.GetValueByKey, SetValueByKey = _a.SetValueByKey;
function DBCreateTables() {
    return __awaiter(this, void 0, void 0, function () {
        var TableOneQuery, TableTwoQuery, TableBalanceQuery, TableUsersQuery, TableVestingsQuery, TableCDQuery, TableNEKeysQuery, TablePDQuery, TableLogsQuery, web3, endBlock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    TableOneQuery = 'CREATE TABLE IF NOT EXISTS address_to_referral (' +
                        'id SERIAL PRIMARY KEY, address varchar(512) NOT NULL,' +
                        'link_key varchar(512) NOT NULL );';
                    TableTwoQuery = 'CREATE TABLE IF NOT EXISTS referral_owner (' +
                        'id SERIAL PRIMARY KEY,' +
                        'address varchar(512) NOT NULL,' +
                        'link_key varchar(512) NOT NULL,' +
                        'value_primary int NOT NULL,' +
                        'value_secondary int NOT NULL );';
                    TableBalanceQuery = 'CREATE TABLE IF NOT EXISTS balances (' +
                        'id SERIAL PRIMARY KEY,' +
                        'address varchar(512) NOT NULL UNIQUE,' +
                        'balance_scheduled float NOT NULL,' +
                        'balance_available float NOT NULL,' +
                        'balance_withdrawn float NOT NULL);';
                    TableUsersQuery = 'CREATE TABLE IF NOT EXISTS users (' +
                        'id SERIAL PRIMARY KEY,' +
                        'login varchar(256) NOT NULL UNIQUE,' +
                        'rights varchar(256) NOT NULL,' +
                        'address varchar(512) NOT NULL UNIQUE );';
                    TableVestingsQuery = 'CREATE TABLE IF NOT EXISTS vestings (' +
                        'id SERIAL PRIMARY KEY,' +
                        'address varchar(512) NOT NULL,' +
                        'value_total float NOT NULL,' +
                        'value_paid float NOT NULL,' +
                        'date_start timestamp NOT NULL,' +
                        'date_watched timestamp NOT NULL,' +
                        'date_end timestamp NOT NULL,' +
                        'date_paid timestamp NOT NULL );';
                    TableCDQuery = 'CREATE TABLE IF NOT EXISTS common_data (' +
                        'id SERIAL PRIMARY KEY,' +
                        'key varchar(512) NOT NULL UNIQUE,' +
                        'value TEXT );';
                    TableNEKeysQuery = 'CREATE TABLE IF NOT EXISTS keys_not_editable (' +
                        'id SERIAL PRIMARY KEY,' +
                        'key varchar(512) NOT NULL UNIQUE);';
                    TablePDQuery = 'CREATE TABLE IF NOT EXISTS public_keys (' +
                        'id SERIAL PRIMARY KEY,' +
                        'key varchar(512) NOT NULL UNIQUE,' +
                        'project varchar(512) NOT NULL );';
                    TableLogsQuery = 'CREATE TABLE IF NOT EXISTS logs (' +
                        'id SERIAL PRIMARY KEY,' +
                        'date timestamp NOT NULL,' +
                        'address varchar(512) NOT NULL,' +
                        'message varchar(512) );';
                    return [4, connection.query(TableOneQuery)];
                case 1:
                    _a.sent();
                    return [4, connection.query(TableTwoQuery)];
                case 2:
                    _a.sent();
                    return [4, connection.query(TableBalanceQuery)];
                case 3:
                    _a.sent();
                    return [4, connection.query(TableUsersQuery)];
                case 4:
                    _a.sent();
                    return [4, connection.query(TableVestingsQuery)];
                case 5:
                    _a.sent();
                    return [4, connection.query(TableCDQuery)];
                case 6:
                    _a.sent();
                    return [4, connection.query(TableNEKeysQuery)];
                case 7:
                    _a.sent();
                    return [4, connection.query(TableLogsQuery)];
                case 8:
                    _a.sent();
                    return [4, connection.query(TablePDQuery)];
                case 9:
                    _a.sent();
                    web3 = new Web3(config.rpc);
                    return [4, web3.eth.getBlockNumber()];
                case 10:
                    endBlock = _a.sent();
                    if (!!GetValueByKey(nessesary_keys.publickey)) return [3, 12];
                    return [4, SetValueByKey(nessesary_keys.publickey, '0x00')];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12:
                    if (!!GetValueByKey(nessesary_keys.privatekey)) return [3, 14];
                    return [4, SetValueByKey(nessesary_keys.privatekey, '0x00')];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14:
                    if (!!GetValueByKey(nessesary_keys.lastblock)) return [3, 16];
                    return [4, SetValueByKey(nessesary_keys.lastblock, "".concat(endBlock))];
                case 15:
                    _a.sent();
                    _a.label = 16;
                case 16: return [2, true];
            }
        });
    });
}
function DBMigration() {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, migrate({ connection: connection }, process.env.DB_MIGRATION_DIR)];
                case 1:
                    _a.sent();
                    return [3, 3];
                case 2:
                    e_1 = _a.sent();
                    console.log("Thrown exception : ");
                    console.log(e_1.message);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
switch (process.argv[2]) {
    case "--create":
        try {
            DBCreateTables();
        }
        catch (e) {
            console.log(e.message);
        }
        break;
    case "--migrate":
        try {
            DBMigration();
        }
        catch (e) {
            console.log(e.message);
        }
        break;
    default:
        try {
            DBMigration();
        }
        catch (e) {
            console.log(e.message);
        }
        break;
}
//# sourceMappingURL=migration.js.map