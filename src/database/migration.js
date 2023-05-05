require('dotenv').config();
const { connection } = require('./connection')
const { migrate} = require("postgres-migrations")

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
      'rights varchar(256) NOT NULL UNIQUE,'+
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
  
    await connection.query(TableOneQuery)
    await connection.query(TableTwoQuery)
    await connection.query(TableBalanceQuery)
    await connection.query(TableUsersQuery)
    await connection.query(TableVestingsQuery)
    await connection.query(TableCDQuery)
    return true
  }

async function DBMigration () {
  await migrate(connection, process.env.DB_MIGRATION_DIR)
}

switch(process.argv[2]) {
   case "--create" :
      DBCreateTables ()
      break;
   case "--migrate" :
      DBMigration ()
      break;
   default :
      DBMigration ()
      break;
}  