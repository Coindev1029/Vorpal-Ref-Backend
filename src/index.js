const dEnv = require('dotenv');
const { AddNewLink,  RegisterReferral, GetLinksByOwner, GetRefCount } = require('./database/links');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();

dEnv.config();

const port = process.argv[2] ? process.argv[2] : process.env.DEFAULT_PORT

// var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
// var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

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
   res.status(200).send(JSON.stringify({
      links : links,
      refCount: 0,
      balanceScheduled: 0,
      balanceAvailable: 0
   }));
})



app.post('/api', async (req, res) => {

  const postData = req.body;

  console.log("req body: ")
  console.log(postData)

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
        result: await GetLinksByOwner ( postData.owner )
      }));
     default:
        res.status(200).send(JSON.stringify({
          condition: 'Default'
        }));
        res.end()
     break;
  }



  /* res.status(200).send(JSON.stringify({
    condition: 'Default'
  }));
  res.end() */
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
  owner:  '0x047d3295Bb5b14fF3F85Ecb29f08A1B47278Ff78',
  reward1: 90,
  reward2: 10
}
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

{
  action: "RegisterReferral",
  client: '0xAE8A7aC2358505a11f51c7a1C1522D7b95Afe66F',
  link: 'ac21766476906b650f7502530a796f19'
}

{
  action: "GetLinksByOwner",
  owner:  '0xAE8A7aC2358505a11f51c7a1C1522D7b95Afe66F'
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
  

