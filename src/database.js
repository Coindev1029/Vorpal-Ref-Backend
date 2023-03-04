require('dotenv').config();
const { Client } = require('pg');
const { GenerateLink }= require('./generateLink')

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
   const newLink = GenerateLink(owner)
   console.log(newLink)
   return newLink
}

//Registering a new referral. Only one referral link to address, 
//returns true is it was registered, false if not
async function RegisterReferral ( address, link ) {
   const CheckQuery = `select count(*) from address_to_referral where address = '${address}';`
   const checkResult = await connection.query(CheckQuery)

   if (checkResult.rows) {
     if (checkResult.rows.count === 0) {
        console.log("true here")
        return true
     } else {
       return false
     }
   } else {
     return false;
   }

}

module.exports = {
  AddNewLink,
  RegisterReferral
}