require('dotenv').config();
const { Client } = require('pg');
const http = require('http')

const b = '\\'
console.log('b : ')
console.log(b)

const connectionData = {
  user: process.env.db_user,
  host: process.env.db_host,
  database: process.env.db_name,
  password: String.raw(`7SsvK{\aR*5W$5d-`), //process.env.db_password,
  port: process.env.db_port,
}

console.log("Connection data : ")
console.log(connectionData)

const connection = new Client(connectionData);

const connectionResult = connection.connect((err, res) => {
  if (res) {
      console.log("Res : ")
      console.log(res)
  }
  if (err) {
      console.log("Err : ")
      console.log(err)
  }
})

console.log("Connection : ")
console.log(connectionResult)

async function testQuery () {
  const sqlQuery = "select * from address_to_referral limit 1;"
  const queryResult = connection.query(sqlQuery, (err, res) => {
      if (err) {
          console.log(err)
          return err;
      };
      console.log(res.rows);
      connection.end();
      return res.rows;
    })
  console.log(queryResult)
  return queryResult
}

console.log("query : ")
testQuery ().then((res) => {
  console.log(res)
})


// console.log("Connection : ")
//console.log(connection)

// const { connectionResult } = require('./database/connect')

const port = process.argv[2] ? process.argv[2] : process.env.default_port

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Connected on port');
 });

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log("query : ")
    testQuery().then((res) => {
      console.log(res)
    })
  })

  

