require('dotenv').config();
import { GameResult } from 'types';
import { connection } from '../connection'

async function CreatePlayerStatsRow ( player: string) : Promise<boolean> {
     
    const CheckPlayerQuery = `SELECT COUNT(*) FROM player_stats WHERE address = '${player}';`
    console.log(CheckPlayerQuery)
    const OpenStatsQuery = `
    INSERT INTO player_stats ( 
        address, 
        games, 
        wins ) VALUES (
            '${player}', 
            0, 
            0
            );`
    const check = await connection.query(CheckPlayerQuery)
    const count = check.rows[0].count
    if (Number(count) === 0) {
        console.log("Creating ... ")
        console.log(await connection.query(OpenStatsQuery))
        return true
    }
    return false
}

export async function SaveGameResult (result: GameResult) : Promise<boolean> {
    const address1 = result.playerOne.toLowerCase()
    const address2 = result.playerTwo.toLowerCase()
    const GameQuery = `INSERT INTO game_stats ( 
        date, 
        player_one, 
        player_two, 
        winner, 
        star_id_one, 
        star_id_two, 
        planet_id_one, 
        planet_id_two) 
    VALUES (to_timestamp(${result.date}), 
	'${address1}', 
	'${address2}',
	${result.winner}, 
    ${result.star_id_one}, 
    ${result.star_id_two}, 
    ${result.planet_id_one}, 
    ${result.planet_id_two});`

    const UpdPlayerOne = (result.winner === 1) ? `
      UPDATE player_stats SET 
      games = games+1, 
      wins=wins+1 WHERE address = '${address1}';` : `
      UPDATE player_stats SET 
      games = games+1 WHERE address = '${address1}';`
    console.log(UpdPlayerOne)
    const UpdPlayerTwo= (result.winner === 2) ? `
      UPDATE player_stats SET 
      games = games+1, 
      wins=wins+1 WHERE address = '${address1}';` : `
      UPDATE player_stats SET 
      games = games+1 WHERE address = '${address1}';`
    console.log(UpdPlayerTwo)

    await CreatePlayerStatsRow ( address1 )
    await CreatePlayerStatsRow ( address2 )
    await connection.query(GameQuery)
    console.log("Updates : ")
    console.log(await connection.query(UpdPlayerOne))
    console.log(await connection.query(UpdPlayerTwo))

    return true
}