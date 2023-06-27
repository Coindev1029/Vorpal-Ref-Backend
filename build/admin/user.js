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
var WriteLog = require('./log').WriteLog;
var CheckRights = require('./functions').CheckRights;
var _a = require('../database/users'), UpdateUser = _a.UpdateUser, CreateUser = _a.CreateUser, DeleteUser = _a.DeleteUser, RequestUsers = _a.RequestUsers;
function RequestUserData(request) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, CheckRights(request.signature)];
                case 1:
                    user = _a.sent();
                    if (!user) {
                        return [2, ({
                                success: false,
                                error: 'Signature not found',
                                content: null
                            })];
                    }
                    return [4, RequestUsers()];
                case 2: return [2, _a.sent()];
            }
        });
    });
}
function UpdateUserDataAction(request) {
    return __awaiter(this, void 0, void 0, function () {
        var user, updates, creations, actionResultsUpdate, actionResultsCreate, actionResultsDelete, currentUsers, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!request.data) {
                        return [2, ({
                                success: false,
                                error: 'User data not found'
                            })];
                    }
                    return [4, CheckRights(request.signature, request.message)];
                case 1:
                    user = _c.sent();
                    if (!user) {
                        return [2, ({
                                success: false,
                                error: 'Signature not found or invalid'
                            })];
                    }
                    updates = [];
                    creations = [];
                    actionResultsUpdate = [];
                    actionResultsCreate = [];
                    actionResultsDelete = [];
                    _b = (_a = JSON).stringify;
                    return [4, RequestUsers()];
                case 2:
                    currentUsers = _b.apply(_a, [_c.sent()]);
                    request.data.users.forEach(function (user) {
                        if (currentUsers.indexOf(user.address) < 0) {
                            creations.push(user);
                        }
                        else {
                            updates.push(user);
                        }
                    });
                    updates.forEach(function (item) {
                        actionResultsUpdate.push(UpdateUser(item));
                    });
                    creations.forEach(function (item) {
                        actionResultsCreate.push(CreateUser(item));
                    });
                    request.data.deletions.forEach(function (address) {
                        actionResultsDelete.push(DeleteUser(address));
                    });
                    return [2, ({
                            updates: actionResultsUpdate,
                            creations: actionResultsCreate,
                            deletions: actionResultsDelete
                        })];
            }
        });
    });
}
export { UpdateUserDataAction, RequestUserData };
//# sourceMappingURL=user.js.map