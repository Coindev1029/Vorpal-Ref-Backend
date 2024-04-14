import { StartWatchingTimer } from "./blockchain/Stars/watcher";
import { InitGameIoServer } from "./game";
import { AdminDataRequest, AdminSaveData, AdminUpdateUserData, CreateBox, GetAdminUserData, GetAllStars, GetLinksByOwnerResponse, GetOwnerDataResponse, GetProjectData, ReferralApiDefault, UpdateAllStars, UpdateOneStar, WithdrawRewardAction } from "./responces";
const dEnv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

dEnv.config();

const port = process.argv[2] ? process.argv[2] : process.env.DEFAULT_PORT

// End boxes

app.use(express.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
  res.status(200).send('API homepage');
})

   /*
   res.setHeader("Access-Control-Allow-Origin", "*" );
   res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE");
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
   res.setHeader('Access-Control-Allow-Credentials', 'true');
   */

// Boxes
app.post('/api/boxes/create', CreateBox)

// Referral
app.post('/api', ReferralApiDefault)

app.get('/api/getlinksbyowner/:id', GetLinksByOwnerResponse)

app.get('/api/getownerdata/:id', GetOwnerDataResponse)

app.get('/api/public/:project', GetProjectData)

app.post('/api/withdraw', WithdrawRewardAction)

// Stars (server contract parser)
app.get('/api/getstarlist', GetAllStars)

app.post('/api/updatestars', UpdateAllStars)

app.post('/api/updateonestar/:id', UpdateOneStar)

// Admin panel
app.post('/api/admin/requestdata', AdminDataRequest)

app.post('/api/admin/savedata', AdminSaveData)

app.post('/api/admin/getusers', GetAdminUserData)

app.post('/api/admin/updateusers', AdminUpdateUserData)

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

// InitGameIoServer()
StartWatchingTimer();

