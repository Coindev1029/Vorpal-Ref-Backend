require('dotenv').config();
import { Pool, ClientConfig } from 'pg';

const connectionData : ClientConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, //process.env.db_password,
    port: Number(process.env.DB_PORT),
    idleTimeoutMillis: 10000,
    max: 50
  }

export const pool = new Pool(connectionData);

pool.on('connect', () => {
  console.log('Database connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function Q(query: string, withReturn?: boolean): Promise<any> {
  const client = await pool.connect();
  try {
    const result = await client.query(query);
    return withReturn ? result.rows : true;
  } catch (e) {
    console.error(e.message);
    console.error(query);
    return null;
  } finally {
    client.release();
  }
}