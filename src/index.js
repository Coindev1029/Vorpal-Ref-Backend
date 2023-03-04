require('dotenv').config();
const { AddNewLink,  RegisterReferral } = require('./database');
const http = require('http')

const port = process.argv[2] ? process.argv[2] : process.env.default_port

console.log(AddNewLink('0xDD099d768d18E9a6b0bd9DFa02A5FD3A840a273f'))
console.log(RegisterReferral('0xDD099d768d18E9a6b0bd9DFa02A5FD3A840a273f'))

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain', "Access-Control-Allow-Origin": "*" });
    res.end('Connected on port');
 });

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);

  })

  

