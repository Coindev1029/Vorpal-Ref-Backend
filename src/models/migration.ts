require('dotenv').config();
import { migrate } from 'postgres-migrations';
import { runQuery as Q, pool } from './connection';
import Web3 from 'web3';
import * as config from '../blockchain/config';
import { nessesary_keys } from '../config';
import { GetValueByKey, SetValueByKey } from './balances';

async function DBCreateTables() {
  const TableOneQuery =`
    CREATE TABLE IF NOT EXISTS address_to_referral (
      id SERIAL PRIMARY KEY, address varchar(512) NOT NULL,
      link_key varchar(512) NOT NULL 
    );
    `;

  const TableTwoQuery =`
      CREATE TABLE IF NOT EXISTS referral_owner (
        id SERIAL PRIMARY KEY,
        address varchar(512) NOT NULL,
        link_key varchar(512) NOT NULL,
        value_primary int NOT NULL,
        value_secondary int NOT NULL 
      );
      `;

  const TableBalanceQuery =`
    CREATE TABLE IF NOT EXISTS balances (
      id SERIAL PRIMARY KEY,
      address varchar(512) NOT NULL UNIQUE,
      balance_scheduled float NOT NULL,
      balance_available float NOT NULL,
      balance_withdrawn float NOT NULL
    );
    `;

  const TableUsersQuery =`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      login varchar(256) NOT NULL UNIQUE,
      rights varchar(256) NOT NULL,
      address varchar(512) NOT NULL UNIQUE 
    );`;

  const TableVestingsQuery =`
    CREATE TABLE IF NOT EXISTS vestings (
      id SERIAL PRIMARY KEY,
      address varchar(512) NOT NULL,
      value_total float NOT NULL,
      value_paid float NOT NULL,
      date_start timestamp NOT NULL,
      date_watched timestamp NOT NULL,
      date_end timestamp NOT NULL,
      date_paid timestamp NOT NULL 
    );`;

  const TableCDQuery =`
    CREATE TABLE IF NOT EXISTS common_data (
      id SERIAL PRIMARY KEY,
      key varchar(512) NOT NULL UNIQUE,
      value TEXT 
    );`;

  const TableNEKeysQuery =`
    CREATE TABLE IF NOT EXISTS keys_not_editable (
      id SERIAL PRIMARY KEY,
      key varchar(512) NOT NULL UNIQUE
    );`;

  const TablePDQuery =`
    CREATE TABLE IF NOT EXISTS public_keys (
      id SERIAL PRIMARY KEY,
      key varchar(512) NOT NULL UNIQUE,
      project varchar(512) NOT NULL 
    );`;

  const TableLogsQuery =`
    CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      date timestamp NOT NULL,
      address varchar(512) NOT NULL,
      message varchar(512) 
    );`;

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

  const ResourceTransactionLog = `
  CREATE TABLE IF NOT EXISTS "resource_txn_log" (
    id serial PRIMARY KEY,
    userlogin varchar(128),
    time timestamp,
    resource varchar(128),
    amount integer,
    reason varchar(256)
  );
  `

  const TGPersonalQuery = `
  CREATE TABLE IF NOT EXISTS "telegram_personal" (
    id serial PRIMARY KEY,
	  user_id varchar(128) NOT NULL UNIQUE,
	  first_name varchar(128),
  	last_name varchar(128),
  	username varchar(128),
  	last_auth_hash varchar(512),
  	last_auth_date integer,
    inviter varchar(128), 
    chat_id varchar(128)
  );
  `

  const storeItemsQuery = `
  CREATE TABLE IF NOT EXISTS "store_items" (
    id serial PRIMARY KEY,
	  item varchar(128) NOT NULL UNIQUE,
  	type varchar(128),
    rareness varchar(128),
    description varchar(256),
  	img_preview varchar(512),
    img_full varchar(512),
    per_user integer,
    total_count integer,
	  cost integer,
	  currency varchar(128)
  );
  `

  const storeItemBalanceQuery = `
  CREATE TABLE IF NOT EXISTS "store_item_balances" (
    id serial PRIMARY KEY,
	  user_name varchar(128),
  	item_id integer,
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

  const messagesQuery = `
  CREATE TABLE IF NOT EXISTS "telegram_messages" (
    id serial PRIMARY KEY,
    chat_id varchar(128) NOT NULL,
    message_id varchar(128) NOT NULL
  );
  `

  const referralStatsQuery = `
  CREATE TABLE IF NOT EXISTS "telegram_referral_stats" (
    id serial PRIMARY KEY,
    recipient varchar(64),
    referrer varchar(64),
    resource varchar(128),
    amount integer,
    reward_date integer,
    level integer
  );
  `

  const duelStatsQuery = `
  CREATE TABLE IF NOT EXISTS "duel_player_stats" (
    id serial PRIMARY KEY,
    duel_id varchar(128),
    player varchar(64),
    damage_total integer,
    experience integer,
    gold integer
  );
  `

  await Q(TableOneQuery);
  await Q(TableTwoQuery);
  await Q(TableBalanceQuery);
  await Q(TableUsersQuery);
  await Q(TableVestingsQuery);
  await Q(TableCDQuery);
  await Q(TableNEKeysQuery);
  await Q(TableLogsQuery);
  await Q(TablePDQuery);
  await Q(TableBoxes);
  await Q(TableResource);
  await Q(TableResource);
  await Q(TablePDQuery);
  await Q(Duels);
  await Q(BoxLog);
  await Q(ResourceTransactionLog);
  await Q(TGPersonalQuery);
  await Q(storeItemsQuery);
  await Q(uniqueItemQuery);
  await Q(storeItemBalanceQuery);
  await Q(tgSubscribeQuery);
  await Q(messagesQuery);
  await Q(referralStatsQuery);
  await Q(duelStatsQuery);

  const web3 = new Web3(config.opBSCData.rpcUrl);
  const endBlock = await web3.eth.getBlockNumber();

  if (!GetValueByKey(nessesary_keys.publickey))
    await SetValueByKey(nessesary_keys.publickey, '0x00');
  if (!GetValueByKey(nessesary_keys.privatekey))
    await SetValueByKey(nessesary_keys.privatekey, '0x00');
  if (!GetValueByKey(nessesary_keys.lastblock))
    await SetValueByKey(nessesary_keys.lastblock, `${endBlock}`);

  return true;
}

/* export async function DBMigration() {
  try {
    await migrate({ pool }, process.env.DB_MIGRATION_DIR);
  } catch (e) {
    console.log('Thrown exception : ');
    console.log(e.message);
  }
} */

switch (process.argv[2]) {
  case '--create':
    try {
      DBCreateTables();
    } catch (e) {
      console.log(e.message);
    }
    break;
  case '--migrate':
    /* try {
      DBMigration();
    } catch (e) {
      console.log(e.message);
    } */
    break;
}
