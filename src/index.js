require('dotenv').config();
const { Client } = require('pg');
const http = require('http')

const connectionData = {
  user: process.env.db_user,
  host: process.env.db_host,
  database: process.env.db_name,
  password: process.env.db_password,
  port: process.env.db_port,
}

console.log("Connection data : ")

console.log(connectionData)

const connection = new Client({
  user: process.env.db_user,
  host: process.env.db_host,
  database: process.env.db_name,
  password: process.env.db_password,
  port: process.env.db_port,
});

console.log("Connection : ")
console.log(connection)

// const { connectionResult } = require('./database/connect')

const port = process.argv[2] ? process.argv[2] : process.env.default_port

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Connected on port');
 });

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  })

  

