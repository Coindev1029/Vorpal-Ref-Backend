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

function IsWrongString ( arg ) {
  if (!arg) return true
  if (arg.indexOf(";") > -1) return true
  if (arg.indexOf(" ") > -1) return true

  return false
}

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
  
  await connection.query(TableOneQuery)
  await connection.query(TableTwoQuery)
  return true
}

//New link generation, returns new link
async function AddNewLink ( owner, reward1, reward2 ) {
   if (IsWrongString(owner)) return null
   if (typeof(reward1) !== 'number' || typeof(reward2) !== 'number'  || ( reward2 + reward1 > 100)) return null

   const CheckQuery = `select count(*) from referral_owner where address = '${owner}';`;

   const CheckAddrExists = await connection.query(CheckQuery)
   console.log(CheckAddrExists.rows)
   
   if (CheckAddrExists.rows[0] && CheckAddrExists.rows[0].count !== '0') {
      return ""
   }

   const newLink = GenerateLink(owner)
   const linkAddQuery = `INSERT INTO referral_owner(address, link_key, value_primary, value_secondary) VALUES('${owner}', '${newLink}', '${reward1}', '${reward2}');`

   const execAdd = await connection.query(linkAddQuery)

   console.log(execAdd)

   return newLink
}

//Registering a new referral. Only one referral link to address, 
//returns true is it was registered, false if not
async function RegisterReferral ( address, link ) {

   if( IsWrongString ( address ) || IsWrongString ( link )) return {
      result: false,
      error: "Incorrect entry"
   }
   
   const CheckQuery = `select count(*) from address_to_referral where address = '${address}';`
   const addQuery = `INSERT INTO address_to_referral(address, link_key) VALUES ('${address}', '${link}');`
   const checkResult = await connection.query(CheckQuery)

   if (checkResult.rows[0]) {

     if (checkResult.rows[0].count === '0') {

        const additionResult = await connection.query(addQuery)
        if (additionResult.rowCount > 0) {
          return {
            result: true,
            error: "",
            message: "Client succseefully registered"
          }
        } else {
          return false
        }
     } else {
       return  {
        result: false,
        error: "Client is already registered"
       }
     }
   } else {
     return {
       result: false,
       error: "Failed to connect with database"
      }
   }

}

async function GetLinksByOwner (owner) {

  if (IsWrongString ( owner )) return []
  
   const getterQuery = `SELECT address, link_key, value_primary, value_secondary FROM referral_owner WHERE address = '${owner}';`
   const links = await connection.query(getterQuery)

   return links.rows
}

module.exports = {
  DBMigration,
  AddNewLink,
  RegisterReferral,
  GetLinksByOwner
}