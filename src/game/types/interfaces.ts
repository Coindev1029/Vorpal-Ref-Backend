import WebSocket from "ws";
import { PlayerState } from ".";

export interface GameObject {
    coords: number[]
    owner: string
    lifecycle: string
    params: any
}

export interface Player {
  id: string;
  ws: WebSocket;
  publicKey: string;
}
export interface PlayerRow extends Player {
  state: PlayerState;
}