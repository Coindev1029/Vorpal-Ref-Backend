import WebSocket from 'ws';
import { PlayerState, playerStateKeys } from './types';

const players = new Map<string, WebSocket>();
const playerStates = new Map<string, PlayerState>();
export const playerKeys = new Map<string, string>();

const playerDefaultState: PlayerState = {
  auth: false,
  inLookingFor: false,
  inGame: false,
  starId: -1,
  planetId: -1,
  roomId: -1,
};

export function CreatePlayer(ws: WebSocket, publicKey: string): string {
  for (const [key, val] of playerKeys.entries()) {
    if (val === publicKey) {
      return '';
    }
  }
  const sId = String(Math.round(Math.random() * 1000000000));
  ws.on('close', () => {
    RemovePlayer(sId);
  });
  players.set(sId, ws);
  playerStates.set(sId, playerDefaultState);
  playerKeys.set(sId, publicKey);
  return sId;
}

export function RemovePlayer(playerId: string): string {
  players.delete(playerId);
  playerStates.delete(playerId);
  playerKeys.delete(playerId);
  return playerId;
}

export function GetPlayerList() {
  return players;
}

export function GetPlayerStateList() {
  return playerStates;
}

export function GetPlayerConnectionById(
  playerId: string,
): WebSocket | undefined {
  return players.get(playerId);
}

export function GetPlayerId(ws: WebSocket): string | undefined {
  for (const [key, val] of players.entries()) {
    if (val === ws) {
      return key;
    }
  }
}

export function UpdatePlayerStateSingle(
  playerId: string,
  action: playerStateKeys,
  value: number | boolean,
): boolean {
  const actualState = playerStates.get(playerId);
  if (!actualState) {
    return false;
  }
  const newState: PlayerState = {
    auth: action == 'connected' ? Boolean(value) : actualState.auth,
    inLookingFor:
      action == 'inLookingFor' ? Boolean(value) : actualState.inLookingFor,
    inGame: action == 'inGame' ? Boolean(value) : actualState.inGame,
    planetId: action == 'planetId' ? Number(value) : actualState.starId,
    starId: action == 'starId' ? Number(value) : actualState.planetId,
    roomId: action == 'roomId' ? Number(value) : actualState.roomId,
  };
  playerStates.set(playerId, newState);
  return true;
}

export function UpdatePlayerStateFull(
  playerId: string,
  state: PlayerState,
): boolean {
  const actualState = playerStates.get(playerId);
  if (!actualState) {
    return false;
  }
  playerStates.set(playerId, state);
  return true;
}
