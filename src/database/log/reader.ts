require('dotenv').config();
import { connection } from '../connection';

export async function ReadLogs(count: number = 10) {
    const query = `SELECT * FROM logs ORDER BY id DESC LIMIT ${count}`;
    const logs = await connection.query(query)
    return logs.rows
}
