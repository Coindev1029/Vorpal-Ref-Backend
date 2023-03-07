require('dotenv').config();
const { DBMigration, AddNewLink,  RegisterReferral, GetLinksByOwner } = require('./database');
const http = require('http')
const https = require('https');
const express = require('express');
const app = express();

const port = process.argv[2] ? process.argv[2] : process.env.default_port

app.use(express.json());

async function tests () {
  console.log("Tests : ")
  // console.log(await DBMigration())
  // console.log(await AddNewLink('0xDD099d768d18E9a6b0bd9DFa02A5FD3A840a273f', 10, 20))
  // console.log(await RegisterReferral('0xAE8A7aC2358505a11f51c7a1C1522D7b95Afe66F', 'ac21766476906b650f7502530a796f19'))
  console.log(await GetLinksByOwner('0xDD099d768d18E9a6b0bd9DFa02A5FD3A840a273f'))
}

tests()

app.get('/', (req, res) => {
  res.status(200).send('API homepage');
})

app.post('/api', (req, res) => {

  const postData = req.body;

  console.log(postData)
  res.setHeader("Access-Control-Allow-Origin", "*" );
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  res.status(200).send('Post created');
})

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

/*
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain', "Access-Control-Allow-Origin": "*" });
    res.end('Connected on port');
 });

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);

  })
*/
  

