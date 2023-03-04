require('dotenv').config();
const { DBMigration, AddNewLink,  RegisterReferral, GetLinksByOwner } = require('./database');
const http = require('http')

const port = process.argv[2] ? process.argv[2] : process.env.default_port

async function tests () {
  console.log("Tests : ")
  // console.log(await DBMigration())
  console.log(await AddNewLink('0xDD099d768d18E9a6b0bd9DFa02A5FD3A840a273f', 10, 20))
  console.log(await RegisterReferral('0xAE8A7aC2358505a11f51c7a1C1522D7b95Afe66F', 'ac21766476906b650f7502530a796f19'))
  console.log(await GetLinksByOwner('0xDD099d768d18E9a6b0bd9DFa02A5FD3A840a273f'))
}

tests()

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain', "Access-Control-Allow-Origin": "*" });
    res.end('Connected on port');
 });

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);

  })

  

