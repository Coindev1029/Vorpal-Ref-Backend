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

//New link generation, returns new link
async function AddNewLink ( owner, reward1, reward2 ) {
   console.log(owner)
}

//Registering a new referral. Only one referral link to address, 
//returns true is it was registered, false if not
async function RegisterReferral ( address, link ) {
   const CheckQuery = `select count(*) from address_to_referral where address = '${address}';`
   const checkResult = await connection.query(CheckQuery)
   console.log(checkResult)
   return checkResult
}

module.exports = {
  AddNewLink,
  RegisterReferral
}