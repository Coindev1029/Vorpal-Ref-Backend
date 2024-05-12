require('dotenv').config();
import { connection } from './connection';
import { CreateGameTables } from './gameplay/tables';
const { migrate } = require('postgres-migrations');
const Web3 = require('web3');
const config = require('../blockchain/config');
const { nessesary_keys } = require('../config');
const { GetValueByKey, SetValueByKey } = require('./balances');

async function DBCreateTables() {
  const TableOneQuery =
    'CREATE TABLE IF NOT EXISTS address_to_referral (' +
    'id SERIAL PRIMARY KEY, address varchar(512) NOT NULL,' +
    'link_key varchar(512) NOT NULL );';

  const TableTwoQuery =
    'CREATE TABLE IF NOT EXISTS referral_owner (' +
    'id SERIAL PRIMARY KEY,' +
    'address varchar(512) NOT NULL,' +
    'link_key varchar(512) NOT NULL,' +
    'value_primary int NOT NULL,' +
    'value_secondary int NOT NULL );';

  const TableBalanceQuery =
    'CREATE TABLE IF NOT EXISTS balances (' +
    'id SERIAL PRIMARY KEY,' +
    'address varchar(512) NOT NULL UNIQUE,' +
    'balance_scheduled float NOT NULL,' +
    'balance_available float NOT NULL,' +
    'balance_withdrawn float NOT NULL);';

  const TableUsersQuery =
    'CREATE TABLE IF NOT EXISTS users (' +
    'id SERIAL PRIMARY KEY,' +
    'login varchar(256) NOT NULL UNIQUE,' +
    'rights varchar(256) NOT NULL,' +
    'address varchar(512) NOT NULL UNIQUE );';

  const TableVestingsQuery =
    'CREATE TABLE IF NOT EXISTS vestings (' +
    'id SERIAL PRIMARY KEY,' +
    'address varchar(512) NOT NULL,' +
    'value_total float NOT NULL,' +
    'value_paid float NOT NULL,' +
    'date_start timestamp NOT NULL,' +
    'date_watched timestamp NOT NULL,' +
    'date_end timestamp NOT NULL,' +
    'date_paid timestamp NOT NULL );';

  const TableCDQuery =
    'CREATE TABLE IF NOT EXISTS common_data (' +
    'id SERIAL PRIMARY KEY,' +
    'key varchar(512) NOT NULL UNIQUE,' +
    'value TEXT );';

  const TableNEKeysQuery =
    'CREATE TABLE IF NOT EXISTS keys_not_editable (' +
    'id SERIAL PRIMARY KEY,' +
    'key varchar(512) NOT NULL UNIQUE);';

  const TablePDQuery =
    'CREATE TABLE IF NOT EXISTS public_keys (' +
    'id SERIAL PRIMARY KEY,' +
    'key varchar(512) NOT NULL UNIQUE,' +
    'project varchar(512) NOT NULL );';

  const TableLogsQuery =
    'CREATE TABLE IF NOT EXISTS logs (' +
    'id SERIAL PRIMARY KEY,' +
    'date timestamp NOT NULL,' +
    'address varchar(512) NOT NULL,' +
    'message varchar(512) );';

  const TableBoxes = `
	CREATE TABLE IF NOT EXISTS "boxes" (
   id serial PRIMARY KEY,
   ownerAddress varchar(512),
   ownerLogin varchar(128),
   level integer,
   isOpen boolean   
);
	`;

  const TableResource = `
  CREATE TABLE IF NOT EXISTS "resources" (
    id serial PRIMARY KEY,
    ownerAddress varchar(512),
    ownerLogin varchar(128),
    laser1 integer,
    laser2 integer,
    laser3 integer,
    spore integer,
    spice integer,
    metal integer,
    token integer,
    biomass integer,
    carbon integer,
    trends integer
 );
  `;

  const Duels = `
  CREATE TABLE IF NOT EXISTS "duels" (
    id serial PRIMARY KEY,
    duel_id varchar(512),
    login1 varchar(128),
    login2 varchar(128),
    creation integer,
    isFinished boolean,
    isExpired boolean,
    winner varchar(128)
  );
  `

  const BoxLog = `
  CREATE TABLE IF NOT EXISTS "box_log" (
    id serial PRIMARY KEY,
    boxId integer,
    opening timestamp,
    openResult varchar(128),
    openAmount integer
  );
  `;

  const TGPersonalQuery = `
  CREATE TABLE IF NOT EXISTS "telegram_personal" (
    id serial PRIMARY KEY,
	  user_id varchar(128) NOT NULL UNIQUE,
	  first_name varchar(128),
  	last_name varchar(128),
  	username varchar(128),
  	last_auth_hash varchar(512),
  	last_auth_date integer
  );
  `

  const storeItemsQuery = `
  CREATE TABLE IF NOT EXISTS "store_items" (
    id serial PRIMARY KEY,
	  item_name varchar(128) NOT NULL UNIQUE,
  	item_type varchar(128),
  	item_img varchar(512),
	  price integer,
	  currency varchar(128)
  );
  `

  const storeItemBalanceQuery = `
  CREATE TABLE IF NOT EXISTS "store_item_balances" (
    id serial PRIMARY KEY,
	  user_name varchar(128),
  	item_name varchar(128),
  	balance integer
  );
  `
  const tgSubscribeQuery = `
  CREATE TABLE IF NOT EXISTS "watching_tg_subscriptions" (
    id serial PRIMARY KEY,
	  channel_name varchar(128),
	  channel_username varchar(128),
	  channel_id varchar(128)
  );
  `

  const uniqueItemQuery = `
  CREATE TABLE IF NOT EXISTS "unique_items" (
    id serial PRIMARY KEY,
	  item_id varchar(128) NOT NULL UNIQUE,
	  item_img varchar(512),
	  item_name varchar(128),
	  item_type varchar(128),
	  price integer,
  	currency varchar(128),
  	owner varchar(128)
  );
  `

  await connection.query(TableOneQuery);
  await connection.query(TableTwoQuery);
  await connection.query(TableBalanceQuery);
  await connection.query(TableUsersQuery);
  await connection.query(TableVestingsQuery);
  await connection.query(TableCDQuery);
  await connection.query(TableNEKeysQuery);
  await connection.query(TableLogsQuery);
  await connection.query(TablePDQuery);
  await connection.query(TableBoxes);
  await connection.query(TableResource);
  await connection.query(TableResource);
  await connection.query(TablePDQuery);
  await connection.query(Duels);
  await connection.query(BoxLog);
  await connection.query(TGPersonalQuery);
  await connection.query(storeItemsQuery);
  await connection.query(uniqueItemQuery);
  await connection.query(storeItemBalanceQuery);
  await connection.query(tgSubscribeQuery);
  await CreateGameTables();

  const web3 = new Web3(config.rpc);
  const endBlock = await web3.eth.getBlockNumber();

  if (!GetValueByKey(nessesary_keys.publickey))
    await SetValueByKey(nessesary_keys.publickey, '0x00');
  if (!GetValueByKey(nessesary_keys.privatekey))
    await SetValueByKey(nessesary_keys.privatekey, '0x00');
  if (!GetValueByKey(nessesary_keys.lastblock))
    await SetValueByKey(nessesary_keys.lastblock, `${endBlock}`);

  return true;
}

export async function DBMigration() {
  try {
    await migrate({ connection }, process.env.DB_MIGRATION_DIR);
  } catch (e) {
    console.log('Thrown exception : ');
    console.log(e.message);
  }
}

switch (process.argv[2]) {
  case '--create':
    try {
      DBCreateTables();
    } catch (e) {
      console.log(e.message);
    }
    break;
  case '--migrate':
    try {
      DBMigration();
    } catch (e) {
      console.log(e.message);
    }
    break;
  default:
    try {
      DBMigration();
    } catch (e) {
      console.log(e.message);
    }
    break;
}
