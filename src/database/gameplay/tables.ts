require('dotenv').config();
import { connection } from '../connection'

export async function CreateGameTables () {
    const TableStatsQuery = `CREATE TABLE IF NOT EXISTS game_stats (
        id SERIAL PRIMARY KEY,
        date timestamp NOT NULL,
        player_one varchar(512) NOT NULL,
        player_two varchar(512) NOT NULL,
        winner int,
        star_id_one int,
        star_id_two int,
        planet_id_one int,
        planet_id_two int
     );`

    const TablePlayersQuery = `CREATE TABLE IF NOT EXISTS player_stats (
        id SERIAL PRIMARY KEY,
        address varchar(512) NOT NULL UNIQUE,
        games int,
        wins int
     );`

     await connection.query(TableStatsQuery)
     await connection.query(TablePlayersQuery)

     return true

}