require('dotenv').config();
import { Client } from 'pg';
var connectionData = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
};
export var connection = new Client(connectionData);
export var connectionResult = connection.connect(function (err) {
    if (err) {
        console.log("Err : ");
        console.log(err);
        return;
    }
    console.log("Database connected");
});
//# sourceMappingURL=connection.js.map