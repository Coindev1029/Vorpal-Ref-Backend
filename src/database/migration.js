require('dotenv').config();
const { connection } = require('./connection');

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
  
    const TableBalanceQuery = 'CREATE TABLE IF NOT EXISTS balances ('+
        'id SERIAL PRIMARY KEY,'+
        'address varchar(512) NOT NULL UNIQUE,'+
        'balance_scheduled float NOT NULL,'+
        'balance_available float NOT NULL,'+
        'balance_withdrawn float NOT NULL);'
  
    await connection.query(TableOneQuery)
    await connection.query(TableTwoQuery)
    await connection.query(TableBalanceQuery)
    return true
  }

  module.exports = {
    DBMigration
  }