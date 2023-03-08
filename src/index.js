require('dotenv').config();
const { DBMigration, AddNewLink,  RegisterReferral, GetLinksByOwner } = require('./database');
const http = require('http')
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();

const port = process.argv[2] ? process.argv[2] : process.env.default_port

app.use(express.json());

const allowed_actions = [
  "CreateLink",
  "RegisterReferral",
  "GetLinksByOwner"
]

async function tests () {
  console.log("Tests : ")
  // console.log(await DBMigration())
  // console.log(await AddNewLink('0xDD099d768d18E9a6b0bd9DFa02A5FD3A840a273f', 10, 20))
  // console.log(await RegisterReferral('0xAE8A7aC2358505a11f51c7a1C1522D7b95Afe66F', 'ac21766476906b650f7502530a796f19'))
  console.log(await GetLinksByOwner('0xDD099d768d18E9a6b0bd9DFa02A5FD3A840a273f'))
}

tests()

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
  res.status(200).send('API homepage');
})

app.post('/api', async (req, res) => {

  const postData = req.body;

  console.log("req body: ")
  console.log(postData)

  res.setHeader("Access-Control-Allow-Origin", "*" );
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');


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
        creation: "ok",
        link: await AddNewLink(postData.owner, postData.reward1, postData.reward2)
      }));
      /* AddNewLink(postData.owner, postData.reward1, postData.reward2).then((res) => {
          if (!res) {
            res.status(400).send(JSON.stringify({
              error: 'Error with data'
            }));
            res.end()
          }

          res.status(200).send(JSON.stringify({
            creation: "ok",
            link: res
          }));
      }) */
      break;
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

{
  action: "CreateLink",
  owner:  '0xAE8A7aC2358505a11f51c7a1C1522D7b95Afe66F',
  reward1: 10,
  reward2: 20
}

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
body: JSON.stringify({ok: "ok"})
}
).then(res => res.json()).then((res) => console.log(res))
*/
  

