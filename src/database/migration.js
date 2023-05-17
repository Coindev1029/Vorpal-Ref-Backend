require('dotenv').config();
const { connection } = require('./connection')
const { migrate } = require("postgres-migrations")
const Web3 = require('web3')
const config = require('../blockchain/config')
const { nessesary_keys } = require('../config')
const { 
  GetValueByKey,
  SetValueByKey
 } = require('./balances')

async function DBCreateTables () {
    const TableOneQuery = 'CREATE TABLE IF NOT EXISTS address_to_referral ('+
    'id SERIAL PRIMARY KEY, address varchar(512) NOT NULL,'+
    'link_key varchar(512) NOT NULL );'
  
    const TableTwoQuery = 'CREATE TABLE IF NOT EXISTS referral_owner (' +
      'id SERIAL PRIMARY KEY,' +
      'address varchar(512) NOT NULL,' +
      'link_key varchar(512) NOT NULL,' +
      'value_primary int NOT NULL,' +
      'value_secondary int NOT NULL );'
  
    const TableBalanceQuery = 'CREATE TABLE IF NOT EXISTS balances ('+
        'id SERIAL PRIMARY KEY,'+
        'address varchar(512) NOT NULL UNIQUE,'+
        'balance_scheduled float NOT NULL,'+
        'balance_available float NOT NULL,'+
        'balance_withdrawn float NOT NULL);'

    const TableUsersQuery = 'CREATE TABLE IF NOT EXISTS users ('+
      'id SERIAL PRIMARY KEY,'+
      'login varchar(256) NOT NULL UNIQUE,'+
      'rights varchar(256) NOT NULL,'+
      'address varchar(512) NOT NULL UNIQUE );'

    const TableVestingsQuery = 'CREATE TABLE IF NOT EXISTS vestings ('+
      'id SERIAL PRIMARY KEY,'+
      'address varchar(512) NOT NULL,'+
      'value_total float NOT NULL,'+
      'value_paid float NOT NULL,'+
      'date_start timestamp NOT NULL,'+
      'date_watched timestamp NOT NULL,'+
      'date_end timestamp NOT NULL,'+
      'date_paid timestamp NOT NULL );'

    const TableCDQuery = 'CREATE TABLE IF NOT EXISTS common_data ('+
      'id SERIAL PRIMARY KEY,'+
      'key varchar(512) NOT NULL UNIQUE,'+
      'value varchar(512) );'

    const TableNEKeysQuery = 'CREATE TABLE IF NOT EXISTS keys_not_editable ('+
    'id SERIAL PRIMARY KEY,'+
    'key varchar(512) NOT NULL UNIQUE);'

    const TableLogsQuery = 'CREATE TABLE IF NOT EXISTS logs ('+
      'id SERIAL PRIMARY KEY,'+
      'date timestamp NOT NULL,'+
      'address varchar(512) NOT NULL,'+
      'message varchar(512) );'
  
    await connection.query(TableOneQuery)
    await connection.query(TableTwoQuery)
    await connection.query(TableBalanceQuery)
    await connection.query(TableUsersQuery)
    await connection.query(TableVestingsQuery)
    await connection.query(TableCDQuery)
    await connection.query(TableNEKeysQuery)
    await connection.query(TableLogsQuery)
    
    const web3 = new Web3(config.rpc); 
    const endBlock = await web3.eth.getBlockNumber()

    if (!GetValueByKey(nessesary_keys.publickey)) await SetValueByKey(nessesary_keys.publickey, '0x00')
    if (!GetValueByKey(nessesary_keys.privatekey)) await SetValueByKey(nessesary_keys.privatekey, '0x00')
    if (!GetValueByKey(nessesary_keys.lastblock)) await SetValueByKey(nessesary_keys.lastblock, `${endBlock}`)

    return true
  }

async function DBMigration () {

  try {
    await migrate({ connection }, process.env.DB_MIGRATION_DIR)
  } catch (e) {
    console.log("Thrown exception : ")
    console.log(e.message)
  }
}

switch(process.argv[2]) {
   case "--create" :
      try {
         DBCreateTables ()
      } catch (e) {
        console.log(e.message)
      }
      break;
   case "--migrate" :
      try {
         DBMigration ()
      } catch (e) {
         console.log(e.message)
      }
      break;
   default :
      try {
         DBMigration ()
      } catch (e) {
         console.log(e.message)
      }
      break;
}  