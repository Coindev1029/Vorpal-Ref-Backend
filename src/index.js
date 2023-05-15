const dEnv = require('dotenv');
const { AddNewLink,  RegisterReferral, GetLinksByOwner, GetRefCount } = require('./database/links');
const { GetBalances, UpdateVestings } = require('./database/balances')
const { RequestAdminData } = require('./admin')
const { WithdrawRevenue } = require('./database/withdraw')
const express = require('express');
const bodyParser = require('body-parser');
const { WatchBlocks } = require('./blockchain/WatchBlocks');
const app = express();

dEnv.config();

const port = process.argv[2] ? process.argv[2] : process.env.DEFAULT_PORT

// var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
// var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

const chainMonitoring = setInterval(() => {
  WatchBlocks().then(
      UpdateVestings()
  )
}, 86400000) 

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

app.post('/api/admin/requestdata', async (req, res) => {

   /*
   res.setHeader("Access-Control-Allow-Origin", "*" );
   res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE");
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
   res.setHeader('Access-Control-Allow-Credentials', 'true');
   */
   console.log("Requested")
   console.log(req.body)
   const authResult = await RequestAdminData(req.body)
   console.log(authResult)
   res.status(200).send(JSON.stringify({
      data : authResult
   }))
})

app.post('/api/withdraw', async (req, res) => {
  /*
  res.setHeader("Access-Control-Allow-Origin", "*" );
  res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE");
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  */

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

  /* res.setHeader("Access-Control-Allow-Origin", "*" );
  res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE");
  res.setHeader('Access-Control-Request-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json'); */


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

/* 
const credentials = {
  key: process.env.HTTPS_PRIVATE_KEY, 
  cert: process.env.HTTPS_CERT};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(process.argv[2] ? process.argv[2] : process.env.DEFAULT_PORT);
httpsServer.listen(process.argv[3] ? process.argv[3] : process.env.DEFAULT_PORT_HTTPS);

*/
/*

{
  action: "CreateLink",
  owner:  '',
  reward1: 90,
  reward2: 10
}
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

{
  action: "RegisterReferral",
  client: '',
  link: ''
}

{
  action: "GetLinksByOwner",
  owner:  ''
}

Actions: "CreateLink", "RegisterReferral", "GetLinksByOwner"


fetch("/api", {
method: "post", 
headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
body: JSON.stringify({
         action: "GetLinksByOwner",
         owner:  '0xAE8A7aC2358505a11f51c7a1C1522D7b95Afe66F'
      })
}
).then(res => res.json()).then((res) => console.log(res))

fetch("/api", {
method: "post", 
header: {
          'Content-Type': 'application/x-www-form-urlencoded'
      },
body: JSON.stringify({
         action: "GetLinksByOwner",
         owner:  '0xAE8A7aC2358505a11f51c7a1C1522D7b95Afe66F'
      })
}
).then(res => res.json()).then((res) => console.log(res))
*/
  

