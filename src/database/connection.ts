require('dotenv').config();
import { Client, ClientConfig } from 'pg';

const connectionData : ClientConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, //process.env.db_password,
    port: Number(process.env.DB_PORT),
  }

export const connection = new Client(connectionData);


export const connectionResult = connection.connect((err : Error) => {

  if (err) {
      console.log("Err : ")
      console.log(err.message)
      return;
  }

  console.log("Database connected")
})


export async function Q(query: string, withReturn?: boolean): Promise<any> {
  try {
    const result = await connection.query(query);
    return withReturn ? result.rows : true;
  } catch (e) {
    console.log(e.message);
    console.log(query);
    return null;
  }
}
