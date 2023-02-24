require('dotenv').config();
const http = require('http')
const { connectionResult } = require('./database/connect')

const port = process.argv[2] ? process.argv[2] : process.env.default_port

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Connected on port');
 });

console.log("Env : ")
console.log(process.env)

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(connectionResult)
  })

  

