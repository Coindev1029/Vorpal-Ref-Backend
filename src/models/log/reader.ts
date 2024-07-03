require('dotenv').config();
import { runQuery as Q } from '../connection';

export async function ReadLogs(count: number = 10) {
    const query = `SELECT * FROM logs ORDER BY id DESC LIMIT ${count}`;
    const logs = await Q(query)
    return logs || []
}
