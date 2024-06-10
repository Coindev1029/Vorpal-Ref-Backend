import { TelegramBotLaunch } from './telegram';
import { StartWatchingTimer } from './blockchain/Stars/watcher';
import { InitGameIoServer } from './game';
import {
  AdminDataRequest,
  AdminSaveData,
  AdminUpdateUserData,
  AuthByTelegram,
  BalanceAllResponce,
  BalanceResponce,
  BuyResponce,
  CheckAvailableResponce,
  CreateBox,
  DuelDataByLoginResponce,
  DuelDataResponce,
  DuelDeletionResponce,
  FinishDuelResponce,
  GetAdminUserData,
  GetAllStars,
  GetBoxOpenResultResponce,
  GetLinksByOwnerResponse,
  GetOwnerDataResponse,
  GetProjectData,
  GetStoreItemsResponce,
  GetUserAvailableBoxes,
  GetUserResources,
  GiveResourcesResponce,
  IsNeedSubscribes,
  IsUserInDuelResponce,
  OnlineCountResponce,
  OpenBoxRequest,
  OpponentResponce,
  ReferralApiDefault,
  RewardConditionResponce,
  SetupHeadersGlobal,
  UpdateAllStars,
  UpdateOneStar,
  UpdateOnlineCount,
  WithdrawRewardAction,
} from './responces';
const dEnv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

dEnv.config();

const port = process.argv[2] ? process.argv[2] : process.env.DEFAULT_PORT;

// End boxes
// app.use(SetupHeadersGlobal);
app.use(express.json());



app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.get('/', (req, res) => {
  res.status(200).send('API homepage');
});

/*
   res.setHeader("Access-Control-Allow-Origin", "*" );
   res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE");
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
   res.setHeader('Access-Control-Allow-Credentials', 'true');
   */

app.post('/api/telegram/auth', AuthByTelegram);

// Boxes
app.post('/api/boxes/create', CreateBox);

app.post('/api/boxes/open', OpenBoxRequest);

app.post('/api/boxes/openresult', GetBoxOpenResultResponce);

app.post('/api/boxes/available', GetUserAvailableBoxes);

app.post('/api/boxes/assets/give', GiveResourcesResponce);

app.post('/api/boxes/assets', GetUserResources);

// Referral
app.post('/api', ReferralApiDefault);

app.get('/api/getlinksbyowner/:id', GetLinksByOwnerResponse);

app.get('/api/getownerdata/:id', GetOwnerDataResponse);

app.post('/api/withdraw', WithdrawRewardAction);

// Duel
app.get('/api/isinduel/:login', IsUserInDuelResponce);

app.get('/api/getopponent/:login', OpponentResponce);

app.get('/api/dueldata/:id', DuelDataResponce);

app.get('/api/dueldatabylogin/:login', DuelDataByLoginResponce);

app.get('/api/getduelid/:login', DuelDataResponce);

app.get('/api/onlinecount', OnlineCountResponce);

app.get('/api/usersubscribecondition', IsNeedSubscribes);

app.post('/api/finishduel', FinishDuelResponce);

app.post('/api/deleteduel', DuelDeletionResponce);

app.post('/api/updateonlinecount', UpdateOnlineCount);

app.post('/api/rewardcondition', RewardConditionResponce);

app.post('/api/duelrewardcondition', RewardConditionResponce)

//Store
app.get('/api/storeitems', GetStoreItemsResponce);

app.post('/api/store/userbalance', BalanceResponce);

app.post('/api/store/userbalanceall', BalanceAllResponce);

app.post('/api/store/isavailable', CheckAvailableResponce);

app.post('/api/store/buy', BuyResponce);

// Stars (server contract parser)
app.get('/api/getstarlist', GetAllStars);

app.post('/api/updatestars', UpdateAllStars);

app.post('/api/updateonestar/:id', UpdateOneStar);

// Admin panel
app.get('/api/public/:project', GetProjectData);

app.post('/api/admin/requestdata', AdminDataRequest);

app.post('/api/admin/savedata', AdminSaveData);

app.post('/api/admin/getusers', GetAdminUserData);

app.post('/api/admin/updateusers', AdminUpdateUserData);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

TelegramBotLaunch();
StartWatchingTimer();
