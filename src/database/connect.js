const { Client } = require('pg');

const connection = new Client({
    user: process.env.db_user,
    host: process.env.db_host,
    database: process.env.db_name,
    password: process.env.db_password,
    port: process.env.db_port,
  });

export const connectionResult = connection.connect()

export const testQuery = () => {
    const sqlQuery = "select * from address_to_referra limit 1"
    connection.query(sqlQuery, (err, res) => {
        if (err) {
            console.log(err)
            return err;
        };
        console.log(res.rows);
        connection.end();
        return res.rows;
      })
}

