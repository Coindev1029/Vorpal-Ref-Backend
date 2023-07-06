import WebSocket from "ws";

export class GameRoom {
    private players : WebSocket[] = []

    constructor( playerOne : WebSocket, playerTwo: WebSocket) {
          this.players.push(playerOne),
          this.players.push(playerOne)
    }
}