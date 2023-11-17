import WebSocket from 'ws';
import { PlayerState } from '.';
import { coords } from './gameplay';

export interface GameObject {
  coords: number[];
  owner: string;
  lifecycle: string;
  params: any;
}

export interface Player {
  id: string;
  ws: WebSocket;
  publicKey: string;
}
export interface PlayerRow extends Player {
  state: PlayerState;
}

export interface RoomEvent {
  roomId: number;
  type: string;
  data: any;
}

export interface UserEvent {
  userPublicKey: string;
  type: string;
  data: any;
}

export type MoveFunction = (_id: string, center: coords) => any
