require('dotenv').config();
const { Client } = require('pg');

const connectionData = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, //process.env.db_password,
    port: process.env.DB_PORT,
  }

const connection = new Client(connectionData);


const connectionResult = connection.connect((err, res) => {
  if (res) {
      console.log("Database connected")
  }
  if (err) {
      console.log("Err : ")
      console.log(err)
  }
})

module.exports = {
    connection,
    connectionResult
  }