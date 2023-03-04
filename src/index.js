require('dotenv').config();
const { Client } = require('pg');
const http = require('http')
const { GenerateLink } = require('./generateLink')
const { testQuery } = require('./database')

console.log("query : ")
testQuery ().then((res) => {
  console.log(res)
})

const port = process.argv[2] ? process.argv[2] : process.env.default_port

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain', "Access-Control-Allow-Origin": "*" });
    res.end('Connected on port');
    console.log("Link example : ")
    console.log(GenerateLink("0x00"))
 });

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);

  })

  

