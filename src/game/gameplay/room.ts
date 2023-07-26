import WebSocket from 'ws';
import { SaveGameResult } from '../../database/gameplay/save';
import { msg } from '../../game/types';
import { roomTestTimeout } from '../../game/config';
import { WriteLog } from '../../database/log';
import { GetPlayerStateList, playerKeys } from '../state';

export class GameRoom {
  private players: WebSocket[] = [];
  private keys: string[] = [];
  private addresses: string[] = [];
  private winner: 0 | 1 = 0;
  private isActive: boolean = false;

  constructor(
    playerOne: WebSocket,
    playerTwo: WebSocket,
    keyOne: string,
    keyTwo: string,
  ) {
    const publicKeyOne = playerKeys.get(keyOne) || '';
    const publicKeyTwo = playerKeys.get(keyTwo) || '';
    this.players.push(playerOne);
    this.players.push(playerTwo);
    this.keys.push(keyOne);
    this.keys.push(keyTwo);
    this.addresses.push(publicKeyOne);
    this.addresses.push(publicKeyTwo);
  }

  public InputAction(playerKey: string): void {
    if (this.isActive && this.keys.indexOf(playerKey) > -1) {
      const connection =
        playerKey === this.keys[0] ? this.players[0] : this.players[1];
      const inputMsg: msg.roomUpd = {
        action: 'globaldataupdate',
      };
      connection.send(JSON.stringify(inputMsg));
    }
  }

  public Start(): void {
    WriteLog(`${this.addresses[0]} VS ${this.addresses[1]}`, `Game started`);

    this.isActive = true;
    this.players.forEach((player, index) => {
      const startMsg: msg.gameStart = {
        action: 'gamestart',
        opponent: index === 0 ? this.addresses[1] : this.addresses[0],
      };
      player.send(JSON.stringify(startMsg));
      player.on('message', () => this.InputAction(this.keys[index]));
    });

    setTimeout(() => {
      this.Finish();
    }, roomTestTimeout);
  }

  public Finish(): void {
    this.winner = Math.ceil(Math.random() * 2) === 0 ? 0 : 1; // REPLACE!!!

    WriteLog(`${this.addresses[0]} VS ${this.addresses[1]}`, `Game finished`);

    this.isActive = false;
    const playerStates = GetPlayerStateList();
    const playerOneState = playerStates.get(this.keys[0]);
    const playerTwoState = playerStates.get(this.keys[1]);

    const winMsg: msg.gameFinish = {
      action: 'gamefinish',
      win: true,
      data: null,
    };

    const loseMsg: msg.gameFinish = {
      action: 'gamefinish',
      win: false,
      data: null,
    };

    this.players[this.winner].send(JSON.stringify(winMsg));
    this.players[this.winner === 0 ? 1 : 0].send(JSON.stringify(loseMsg));

    const dt = new Date();
    if (playerOneState && playerTwoState)
      SaveGameResult({
        playerOne: this.keys[0],
        playerTwo: this.keys[1],
        winner: this.winner === 0 ? 1 : 2,
        planet_id_one: playerOneState.planetId,
        planet_id_two: playerTwoState.planetId,
        star_id_one: playerOneState.starId,
        star_id_two: playerTwoState.starId,
        date: dt.getTime(),
      });
  }
}
