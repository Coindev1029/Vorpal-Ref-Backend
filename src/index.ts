import { timeUpdateRequestLimit } from "./blockchain/config";
import { StartWatchingTimer, UpdateLastTime, UpdateSingleStar, UpdateStars, actualStarList, lastUpdateRequqstTime } from "./blockchain/Stars/watcher";
import { InitGameIoServer } from "./game";
const dEnv = require('dotenv');
const { AddNewLink,  RegisterReferral, GetLinksByOwner, GetRefCount } = require('./database/links');
const { GetBalances, UpdateVestings } = require('./database/balances')
const { RequestAdminData, SaveNewData, RequestUserData } = require('./admin')
const { WithdrawRevenue } = require('./database/withdraw')
const express = require('express');
const bodyParser = require('body-parser');
const { WatchBlocks } = require('./blockchain/WatchBlocks');
const { UpdateUserDataAction } = require('./admin/user');
const { RequestPublicData } = require('./database/open');
const app = express();

dEnv.config();

const port = process.argv[2] ? process.argv[2] : process.env.DEFAULT_PORT

// var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
// var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

/* const chainMonitoring = setInterval(() => {
  WatchBlocks().then(
      UpdateVestings()
  )
}, 86400000) */

app.use(express.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
  res.status(200).send('API homepage');
})

app.get('/api/getlinksbyowner/:id', async (req, res) => {

  if (!req.params.id) {
    res.status(400).send(JSON.stringify({
      error : "User id is wrong or not specified"
   }));
   return;
  }

  const userId = req.params.id.toLowerCase()
  const links = await GetLinksByOwner ( userId )
   res.status(200).send(JSON.stringify({
      links : links
   }));
})

app.get('/api/getownerdata/:id', async (req, res) => {

  if (!req.params.id) {
    res.status(400).send(JSON.stringify({
      error : "User id is wrong or not specified"
   }));
   return;
  }

  const userId = req.params.id.toLowerCase()
  const links = await GetLinksByOwner ( userId )
  const balances = await GetBalances ( userId )

  let refCount = 0

  for (let v = 0; v < links.length; v++) {
    const response = await GetRefCount (links[v].link_key)

    refCount += Number(response[0].count)
  }

   res.status(200).send(JSON.stringify({
      links : links,
      refCount: refCount,
      balanceScheduled: balances.balanceSheduled || 0,
      balanceAvailable: balances.balanceAvailable || 0
   }));
})

app.get('/api/public/:project', async (req, res) => {

  const resp = JSON.stringify({
    content: await RequestPublicData(req.params.project)
  })

  res.status(200).send(resp)

})

app.get('/api/getstarlist', (req, res) => {
   res.status(200).send(actualStarList); // actualStarList
})

app.post('/api/updatestars', async (req, res) => {
  const date = new Date().getTime();
  const timePast = date - lastUpdateRequqstTime;
  if (timePast > timeUpdateRequestLimit) {
    UpdateLastTime(date);
    await UpdateStars();
    res.status(200).send({success: true, message: 'Star update requested'});
  } else {
    res.status(200).send({success: false, message: 'Too small request interval'}); // actualStarList
  }
})

app.post('/api/updateonestar/:id', async (req, res) => {
  const date = new Date().getTime();
  const timePast = date - lastUpdateRequqstTime;
  try {
    if (timePast > timeUpdateRequestLimit) {
      const starId = Number(req.params.id);
      if (starId > 0 && starId < actualStarList.length) {
        UpdateLastTime(date);
        await UpdateSingleStar(Math.ceil(starId));
        res.status(200).send({success: true, message: 'Star update requested'});
      } else {
        res.status(400).send({success: false, message: 'Wrong star id'});
      }
    } else {
      res.status(200).send({success: false, message: 'Too small request interval'}); // actualStarList
    }
  } catch (e) {
    res.status(400).send({success: false, message: 'Error in processing : ' + e.message});
  }
})

app.post('/api/admin/requestdata', async (req, res) => {

   /*
   res.setHeader("Access-Control-Allow-Origin", "*" );
   res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE");
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
   res.setHeader('Access-Control-Allow-Credentials', 'true');
   */
   console.log ("Requested")
   console.log (req.body)
   const authResult = await RequestAdminData(req.body)
   console.log (authResult)
   res.status(200).send(JSON.stringify({
      data : authResult
   }))
})

app.post('/api/admin/savedata', async (req, res) => {
  console.log ("Saving...")
  console.log (req.body)
  const saveResult = await SaveNewData (req.body)
  console.log (saveResult)
  res.status(200).send(JSON.stringify({
    data : saveResult
 }))
})

app.post('/api/boxes/create', CreateBox)

app.post('/api/admin/getusers', async (req, res) => {

  const Users = await RequestUserData ( req.body )

  res.status(200).send(JSON.stringify({
    data : Users
 }))
})

app.post('/api/admin/updateusers', async (req, res) => {


  const updateReport = await UpdateUserDataAction (req.body)

  res.status(200).send(JSON.stringify({
    data : updateReport
 }))
})

app.post('/api/withdraw', async (req, res) => {

  res.setHeader('Access-Control-Request-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json');

    const postData = req.body;

    if (!postData || !postData.address || !postData.signature) {
      res.status(400).send(JSON.stringify({
        success: false,
        message: 'Post data wrong or not readable'
      }));
      return false
    }
    console.log("Wait for processing")
    const withdrawmsg = await WithdrawRevenue(postData.address, postData.signature)

    res.status(withdrawmsg.success ? 200 : 400).send(JSON.stringify(withdrawmsg));
})



app.post('/api', async (req, res) => {

  const postData = req.body;


  if (!postData || !postData.action) {
    res.status(400).send(JSON.stringify({
      error: 'Action is not specified'
    }));
    res.end()
    return;
  }
  
  switch(postData.action) {
     case "CreateLink":
      if (!postData.owner || !postData.reward1 || !postData.reward2) {
        res.status(400).send(JSON.stringify({
          error: 'Some of required params is missing'
        }));
        res.end()
        return;
      }
      res.status(200).send(JSON.stringify({
        creation: "newLink",
        result: await AddNewLink(postData.owner, postData.reward1, postData.reward2)
      }));
     break;
     case "RegisterReferral":
      if ( !postData.client || !postData.link ) {
        res.status(400).send(JSON.stringify({
          error: 'Some of required params is missing'
        }));
        res.end()
        return;
      }
      res.status(200).send(JSON.stringify({
        creation: "register",
        result: await RegisterReferral ( postData.client, postData.link )
      }));
     break;
     case "GetLinksByOwner":
      if ( !postData.owner ) {
        res.status(400).send(JSON.stringify({
          error: 'Some of required params is missing'
        }));
        res.end()
        return;
      }
      res.status(200).send(JSON.stringify({
        creation: "getLinks",
        result: await GetLinksByOwner ( postData.owner ),
        warn: "Deprecated. Please request from /api/getlinksbyowner/0x1e... as a get param"
      }));
    break;
     default:
        res.status(200).send(JSON.stringify({
          condition: 'Default'
        }));
        res.end()
     break;
  }

})

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

// InitGameIoServer()
StartWatchingTimer();

