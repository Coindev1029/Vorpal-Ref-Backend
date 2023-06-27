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
var _this = this;
var dEnv = require('dotenv');
var _a = require('./database/links'), AddNewLink = _a.AddNewLink, RegisterReferral = _a.RegisterReferral, GetLinksByOwner = _a.GetLinksByOwner, GetRefCount = _a.GetRefCount;
var _b = require('./database/balances'), GetBalances = _b.GetBalances, UpdateVestings = _b.UpdateVestings;
var _c = require('./admin'), RequestAdminData = _c.RequestAdminData, SaveNewData = _c.SaveNewData, RequestUserData = _c.RequestUserData;
var WithdrawRevenue = require('./database/withdraw').WithdrawRevenue;
var express = require('express');
var bodyParser = require('body-parser');
var WatchBlocks = require('./blockchain/WatchBlocks').WatchBlocks;
var UpdateUserDataAction = require('./admin/user').UpdateUserDataAction;
var RequestPublicData = require('./database/open').RequestPublicData;
var app = express();
dEnv.config();
var port = process.argv[2] ? process.argv[2] : process.env.DEFAULT_PORT;
var chainMonitoring = setInterval(function () {
    WatchBlocks().then(UpdateVestings());
}, 86400000);
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.get('/', function (req, res) {
    res.status(200).send('API homepage');
});
app.get('/api/getlinksbyowner/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var userId, links;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.id) {
                    res.status(400).send(JSON.stringify({
                        error: "User id is wrong or not specified"
                    }));
                    return [2];
                }
                userId = req.params.id.toLowerCase();
                return [4, GetLinksByOwner(userId)];
            case 1:
                links = _a.sent();
                res.status(200).send(JSON.stringify({
                    links: links
                }));
                return [2];
        }
    });
}); });
app.get('/api/getownerdata/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var userId, links, balances, refCount, v, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.params.id) {
                    res.status(400).send(JSON.stringify({
                        error: "User id is wrong or not specified"
                    }));
                    return [2];
                }
                userId = req.params.id.toLowerCase();
                return [4, GetLinksByOwner(userId)];
            case 1:
                links = _a.sent();
                return [4, GetBalances(userId)];
            case 2:
                balances = _a.sent();
                refCount = 0;
                v = 0;
                _a.label = 3;
            case 3:
                if (!(v < links.length)) return [3, 6];
                return [4, GetRefCount(links[v].link_key)];
            case 4:
                response = _a.sent();
                refCount += Number(response[0].count);
                _a.label = 5;
            case 5:
                v++;
                return [3, 3];
            case 6:
                res.status(200).send(JSON.stringify({
                    links: links,
                    refCount: refCount,
                    balanceScheduled: balances.balanceSheduled || 0,
                    balanceAvailable: balances.balanceAvailable || 0
                }));
                return [2];
        }
    });
}); });
app.get('/api/public/:project', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var resp, _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _b = (_a = JSON).stringify;
                _c = {};
                return [4, RequestPublicData(req.params.project)];
            case 1:
                resp = _b.apply(_a, [(_c.content = _d.sent(),
                        _c)]);
                res.status(200).send(resp);
                return [2];
        }
    });
}); });
app.post('/api/admin/requestdata', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var authResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Requested");
                console.log(req.body);
                return [4, RequestAdminData(req.body)];
            case 1:
                authResult = _a.sent();
                console.log(authResult);
                res.status(200).send(JSON.stringify({
                    data: authResult
                }));
                return [2];
        }
    });
}); });
app.post('/api/admin/savedata', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var saveResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Saving...");
                console.log(req.body);
                return [4, SaveNewData(req.body)];
            case 1:
                saveResult = _a.sent();
                console.log(saveResult);
                res.status(200).send(JSON.stringify({
                    data: saveResult
                }));
                return [2];
        }
    });
}); });
app.post('/api/admin/getusers', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var Users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, RequestUserData(req.body)];
            case 1:
                Users = _a.sent();
                res.status(200).send(JSON.stringify({
                    data: Users
                }));
                return [2];
        }
    });
}); });
app.post('/api/admin/updateusers', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var updateReport;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, UpdateUserDataAction(req.body)];
            case 1:
                updateReport = _a.sent();
                res.status(200).send(JSON.stringify({
                    data: updateReport
                }));
                return [2];
        }
    });
}); });
app.post('/api/withdraw', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var postData, withdrawmsg;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                res.setHeader('Access-Control-Request-Headers', 'Content-Type, Accept');
                res.setHeader('Content-Type', 'application/json');
                postData = req.body;
                if (!postData || !postData.address || !postData.signature) {
                    res.status(400).send(JSON.stringify({
                        success: false,
                        message: 'Post data wrong or not readable'
                    }));
                    return [2, false];
                }
                console.log("Wait for processing");
                return [4, WithdrawRevenue(postData.address, postData.signature)];
            case 1:
                withdrawmsg = _a.sent();
                res.status(withdrawmsg.success ? 200 : 400).send(JSON.stringify(withdrawmsg));
                return [2];
        }
    });
}); });
app.post('/api', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var postData, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var _p, _q, _r;
    return __generator(this, function (_s) {
        switch (_s.label) {
            case 0:
                postData = req.body;
                if (!postData || !postData.action) {
                    res.status(400).send(JSON.stringify({
                        error: 'Action is not specified'
                    }));
                    res.end();
                    return [2];
                }
                _a = postData.action;
                switch (_a) {
                    case "CreateLink": return [3, 1];
                    case "RegisterReferral": return [3, 3];
                    case "GetLinksByOwner": return [3, 5];
                }
                return [3, 7];
            case 1:
                if (!postData.owner || !postData.reward1 || !postData.reward2) {
                    res.status(400).send(JSON.stringify({
                        error: 'Some of required params is missing'
                    }));
                    res.end();
                    return [2];
                }
                _c = (_b = res.status(200)).send;
                _e = (_d = JSON).stringify;
                _p = {
                    creation: "newLink"
                };
                return [4, AddNewLink(postData.owner, postData.reward1, postData.reward2)];
            case 2:
                _c.apply(_b, [_e.apply(_d, [(_p.result = _s.sent(),
                            _p)])]);
                return [3, 8];
            case 3:
                if (!postData.client || !postData.link) {
                    res.status(400).send(JSON.stringify({
                        error: 'Some of required params is missing'
                    }));
                    res.end();
                    return [2];
                }
                _g = (_f = res.status(200)).send;
                _j = (_h = JSON).stringify;
                _q = {
                    creation: "register"
                };
                return [4, RegisterReferral(postData.client, postData.link)];
            case 4:
                _g.apply(_f, [_j.apply(_h, [(_q.result = _s.sent(),
                            _q)])]);
                return [3, 8];
            case 5:
                if (!postData.owner) {
                    res.status(400).send(JSON.stringify({
                        error: 'Some of required params is missing'
                    }));
                    res.end();
                    return [2];
                }
                _l = (_k = res.status(200)).send;
                _o = (_m = JSON).stringify;
                _r = {
                    creation: "getLinks"
                };
                return [4, GetLinksByOwner(postData.owner)];
            case 6:
                _l.apply(_k, [_o.apply(_m, [(_r.result = _s.sent(),
                            _r.warn = "Deprecated. Please request from /api/getlinksbyowner/0x1e... as a get param",
                            _r)])]);
                return [3, 8];
            case 7:
                res.status(200).send(JSON.stringify({
                    condition: 'Default'
                }));
                res.end();
                return [3, 8];
            case 8: return [2];
        }
    });
}); });
app.listen(port, function () {
    console.log("Listening on port ".concat(port, "..."));
});
//# sourceMappingURL=index.js.map