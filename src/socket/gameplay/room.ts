import WebSocket from "ws";

export class GameRoom {
    private players : WebSocket[] = []
    private keys : string[] = []

    constructor( 
        playerOne : WebSocket, 
        playerTwo: WebSocket,
        keyOne: string,
        keyTwo: string ) {
          this.players.push(playerOne)
          this.players.push(playerTwo)
          this.keys.push(keyOne)
          this.keys.push(keyTwo)
    }

    public Start() : void {
        
    }

    public Finish() : void {

    }
}