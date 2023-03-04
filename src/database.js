require('dotenv').config();
const { Client } = require('pg');
const { GenerateLink }= require('./generateLink')

const connectionData = {
    user: process.env.db_user,
    host: process.env.db_host,
    database: process.env.db_name,
    password: process.env.db_password, //process.env.db_password,
    port: process.env.db_port,
  }

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

module.exports = {
  testQuery
}