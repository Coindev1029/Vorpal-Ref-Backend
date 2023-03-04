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

async function DBMigration () {
  const TableOneQuery = 'CREATE TABLE IF NOT EXISTS address_to_referral ('+
  'id SERIAL PRIMARY KEY, address varchar(512) NOT NULL,'+
  'link_key varchar(512) NOT NULL );'
  const TableTwoQuery = 'CREATE TABLE IF NOT EXISTS referral_owner (' +
    'id SERIAL PRIMARY KEY,' +
    'address varchar(512) NOT NULL,' +
    'link_key varchar(512) NOT NULL,' +
    'value_primary int NOT NULL,' +
    'value_secondary int NOT NULL );'
  
  console.log(await connection.query(TableOneQuery))
  console.log(await connection.query(TableTwoQuery))
  return true
}

//New link generation, returns new link
async function AddNewLink ( owner, reward1, reward2 ) {

   const newLink = GenerateLink(owner)
   const linkAddQuery = `INSERT INTO referral_owner(address, link_key, value_primary, value_secondary) VALUES('${owner}', '${newLink}', '${reward1}', '${reward2}');`

   const execAdd = await connection.query(linkAddQuery)

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
        if (additionResult.rowCount > 0) {
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

async function GetLinksByOwner (owner) {
   const getterQuery = `SELECT * FROM referral_owner WHERE address = '${owner}';`
   const links = connection.query(getterQuery)
   return links.rows
}

module.exports = {
  DBMigration,
  AddNewLink,
  RegisterReferral,
  GetLinksByOwner
}