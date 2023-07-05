const { GetGameById, GetPlayerStats } = require("../database/gameplay/read")
const { SaveGameResult } = require('../database/gameplay/save')

const TestResult = {
    playerOne: '0x000000000000000000000',
    playerTwo: '0x000000000000000000001',
    date: 1600000001,
    winner: 2,
    star_id_one: 0,
    star_id_two: 1,
    planet_id_one: 0,
    planet_id_two: 1
}


console.log(SaveGameResult(TestResult).then((res) => {
    console.log(res)
    console.log("Player : ")
    console.log(GetPlayerStats('0x000000000000000000001').then((res) => {
        console.log(res)
    }))
}))

