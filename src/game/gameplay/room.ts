import { SaveGameResult } from "database/gameplay/save";
import { GetPlayerStateList } from "socket/state";
import { GameResult } from "types";
import WebSocket from "ws";

export class GameRoom {
    private players : WebSocket[] = []
    private keys : string[] = []
    private winner : 1 | 2 = 1
    private isActive : boolean = false

    constructor( 
        playerOne : WebSocket, 
        playerTwo : WebSocket,
        keyOne: string,
        keyTwo: string ) {
          this.players.push(playerOne)
          this.players.push(playerTwo)
          this.keys.push(keyOne)
          this.keys.push(keyTwo)
    }

    public InputAction (playerKey : string) : void {
        if (this.isActive && this.keys.indexOf(playerKey) > -1) {
            const connection = playerKey === this.keys[0] ? this.players[0] : this.players[1]
            connection.send(JSON.stringify({
                action: "gameaction",
                state: "received"
            }))
        }
    }

    public Start() : void {
        this.isActive = true
        this.players.forEach((player, index) => {
            player.send(JSON.stringify({
                action: "gameaction",
                state: "started"
            }))
            player.on('message', () => this.InputAction(this.keys[index]))
        })
    }

    public Finish() : void {
        this.winner = Math.ceil(Math.random() * 2) === 0 ? 1 : 2 // REPLACE!!! 

        this.isActive = false
        const playerStates = GetPlayerStateList ()
        const playerOneState = playerStates.get(this.keys[0])
        const playerTwoState = playerStates.get(this.keys[1])
        const dt = new Date()
        if (playerOneState && playerTwoState)
        SaveGameResult({
            playerOne: this.keys[0],
            playerTwo: this.keys[1],
            winner: this.winner,
            planet_id_one: playerOneState.planetId,
            planet_id_two: playerTwoState.planetId,
            star_id_one: playerOneState.starId,
            star_id_two:  playerTwoState.starId,
            date: dt.getTime()
        })
    }
}