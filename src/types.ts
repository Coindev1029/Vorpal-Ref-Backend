export type GameResult = {
    date: number,
    playerOne: string,
    playerTwo: string,
    winner: 1 | 2,
    star_id_one: number,
    star_id_two: number,
    planet_id_one: number,
    planet_id_two: number
}

export type PlayerStats = {
    address: string,
    games: number,
    wins: number
}

export type ResponseObject = {
    success: boolean,
    message: string
}