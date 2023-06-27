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
var connection = require('./connection').connection;
var GenerateLink = require('../generateLink').GenerateLink;
var defaultBalance = {
    sheduled: null,
    available: null,
    withdrawn: null
};
function IsWrongString(arg) {
    if (!arg)
        return true;
    if (arg.indexOf(";") > -1)
        return true;
    if (arg.indexOf(" ") > -1)
        return true;
    return false;
}
function SetupBalances(owner) {
    return __awaiter(this, void 0, void 0, function () {
        var addOwnerQuery;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (IsWrongString(owner))
                        return [2, null];
                    addOwnerQuery = "INSERT INTO balances (address, balance_scheduled, balance_available, balance_withdrawn)\n   VALUES ( '".concat(owner.toLowerCase(), "', 0, 0, 0) ON CONFLICT (address) DO NOTHING;");
                    return [4, connection.query(addOwnerQuery)];
                case 1:
                    _a.sent();
                    return [2, true];
            }
        });
    });
}
function AddNewLink(owner, reward1, reward2) {
    if (reward1 === void 0) { reward1 = 90; }
    if (reward2 === void 0) { reward2 = 10; }
    return __awaiter(this, void 0, void 0, function () {
        var CheckQuery, CheckAddrExists, newLink, linkAddQuery;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (IsWrongString(owner))
                        return [2, null];
                    if (typeof (reward1) !== 'number' || typeof (reward2) !== 'number' || (reward2 + reward1 > 100))
                        return [2, null];
                    CheckQuery = "select count(*) from referral_owner where address = '".concat(owner, "';");
                    return [4, connection.query(CheckQuery)];
                case 1:
                    CheckAddrExists = _a.sent();
                    if (CheckAddrExists.rows[0] && CheckAddrExists.rows[0].count !== '0') {
                        return [2, ""];
                    }
                    newLink = GenerateLink(owner);
                    linkAddQuery = "INSERT INTO referral_owner(address, link_key, value_primary, value_secondary) VALUES('".concat(owner, "', '").concat(newLink, "', '").concat(reward1, "', '").concat(reward2, "');");
                    return [4, connection.query(linkAddQuery)];
                case 2:
                    _a.sent();
                    try {
                        SetupBalances(owner);
                    }
                    catch (e) {
                        console.log(e.message);
                    }
                    return [2, newLink];
            }
        });
    });
}
function RegisterReferral(address, link) {
    return __awaiter(this, void 0, void 0, function () {
        var CheckQuery, CheckOwnerQuery, addQuery, checkResult, checkOwnerResult, addr, additionResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (IsWrongString(address) || IsWrongString(link))
                        return [2, {
                                result: false,
                                error: "Incorrect entry"
                            }];
                    CheckQuery = "select count(*) from address_to_referral where address = '".concat(address, "';");
                    CheckOwnerQuery = "select address from referral_owner where link_key = '".concat(link, "';");
                    addQuery = "INSERT INTO address_to_referral(address, link_key) VALUES ('".concat(address, "', '").concat(link, "');");
                    return [4, connection.query(CheckQuery)];
                case 1:
                    checkResult = _a.sent();
                    return [4, connection.query(CheckOwnerQuery)];
                case 2:
                    checkOwnerResult = _a.sent();
                    if (checkOwnerResult.rows[0]) {
                        addr = checkOwnerResult.rows[0].address;
                        if (addr.toLowerCase() === address.toLowerCase()) {
                            return [2, {
                                    result: false,
                                    error: "Link owner cannot add a himself"
                                }];
                        }
                    }
                    if (!checkResult.rows[0]) return [3, 6];
                    if (!(checkResult.rows[0].count === '0')) return [3, 4];
                    return [4, connection.query(addQuery)];
                case 3:
                    additionResult = _a.sent();
                    if (additionResult.rowCount > 0) {
                        return [2, {
                                result: true,
                                error: "",
                                message: "Client succseefully registered"
                            }];
                    }
                    else {
                        return [2, false];
                    }
                    return [3, 5];
                case 4: return [2, {
                        result: false,
                        error: "Client is already registered"
                    }];
                case 5: return [3, 7];
                case 6: return [2, {
                        result: false,
                        error: "Failed to connect with database"
                    }];
                case 7: return [2];
            }
        });
    });
}
function GetLinksByOwner(owner) {
    return __awaiter(this, void 0, void 0, function () {
        var getterQuery, links;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (IsWrongString(owner))
                        return [2, []];
                    getterQuery = "SELECT address, link_key, value_primary, value_secondary FROM referral_owner WHERE address = '".concat(owner, "';");
                    return [4, connection.query(getterQuery)];
                case 1:
                    links = _a.sent();
                    return [2, links.rows];
            }
        });
    });
}
function GetRefCount(link) {
    return __awaiter(this, void 0, void 0, function () {
        var countQuery, countRequest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    countQuery = "SELECT COUNT(*) from address_to_referral WHERE link_key = '".concat(link, "';");
                    return [4, connection.query(countQuery)];
                case 1:
                    countRequest = _a.sent();
                    return [2, countRequest.rows];
            }
        });
    });
}
export { AddNewLink, RegisterReferral, GetLinksByOwner, GetRefCount };
//# sourceMappingURL=links.js.map