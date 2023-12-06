require('dotenv').config();
import { GameResult, PlayerStats } from '../../types';
import { connection } from '../connection'

export async function GetGameById (id : number) : Promise<GameResult> {
    const GameQuery = `SELECT * FROM game_stats WHERE id = ${id};`
    const result = await connection.query(GameQuery)
    const row = result.rows[0]
    const game : GameResult = {
        playerOne: row.player_one,
        playerTwo: row.player_two,
        date: new Date(row.date).getTime(),
        winner: Number(row.winner) === 1 ? 1 : 2,
        star_id_one: Number(row.star_id_one),
        star_id_two: Number(row.star_id_two),
        planet_id_one: Number(row.planet_id_one),
        planet_id_two: Number(row.planet_id_two)
    }

    return game
}

export async function GetPlayerStats (player : string) : Promise<PlayerStats | null> {
    const query = `SELECT * FROM player_stats WHERE address = '${player}';`
    const result = await connection.query(query)

    if (result.rows.length < 1) {
        return null
    }
    
    const row = result.rows[0]
    const stats: PlayerStats = {
        address: player,
        games: row.games,
        wins: row.wins
    }
    return stats
}