export * as msg from './msg';
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
