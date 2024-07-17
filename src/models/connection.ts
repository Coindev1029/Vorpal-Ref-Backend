require('dotenv').config();
import { Pool, ClientConfig } from 'pg';

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  idleTimeoutMillis: 5000, // Wait up to 5 seconds before removing idle clients
  max: 50 // Maximum number of clients in the pool
});

/* pool.on('connect', () => {
  console.log('Database connected');
}); */

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function runQuery (query: string, withReturn: boolean = true): Promise<any[] | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(query);
    return withReturn ? result.rows : [true];
  } catch (e) {
    console.error(e.message);
    console.error(query);
    return null;
  } finally {
    client.release();
  }
}