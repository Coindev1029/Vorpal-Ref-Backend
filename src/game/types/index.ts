export * as msg from './Messages';
export * as play from './gameplay';
export { GameObject } from './interfaces'

export type playerStateKeys =
  | 'connected'
  | 'inLookingFor'
  | 'inGame'
  | 'roomId'
  | 'starId'
  | 'planetId';

export type PlayerState = {
  auth: boolean;
  inLookingFor: boolean;
  inGame: boolean;
  starId: number;
  planetId: number;
  roomId: number;
};
