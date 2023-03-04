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
      console.log("Database connected")
  }
  if (err) {
      console.log("Err : ")
      console.log(err)
  }
})

//New link generation, returns new link
async function AddNewLink ( owner, reward1, reward2 ) {

   const newLink = GenerateLink(owner)
   const linkAddQuery = `INSERT INTO referral_owner(address, link_key) VALUES('${owner}', '${newLink}');`
   const registerRewardQuery = `INSERT INTO referral_reward(link_key, value_primary, value_secondary) VALUES ('${owner}', '${reward1}', '${reward2}');`

   const execAdd = await connection.query(linkAddQuery)
   console.log(execAdd)
   const execReward = await connection.query(registerRewardQuery)
   console.log(execReward)
   console.log(newLink)
   return newLink
}

//Registering a new referral. Only one referral link to address, 
//returns true is it was registered, false if not
async function RegisterReferral ( address, link ) {
   const CheckQuery = `select count(*) from address_to_referral where address = '${address}';`
   const addQuery = `INSERT INTO address_to_referral(address, link_key) VALUES ('${address}', '${link}');`
   const checkResult = await connection.query(CheckQuery)

   if (checkResult.rows[0]) {

     if (checkResult.rows[0].count === '0') {

        const additionResult = await connection.query(addQuery)
        if (additionResult.roeCount > 0) {
          return true
        } else {
          return false
        }
     } else {
       console.log("Adress is already registered")
       return false
     }
   } else {
    console.log("rows not found")
     return false;
   }

}

module.exports = {
  AddNewLink,
  RegisterReferral
}