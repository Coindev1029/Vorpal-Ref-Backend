export type GameObjectDictionary<T> = Record<string, T>;
export type movings = 'target' | 'angle' | 'orbit' | 'none';
export type angleDirection = -1 | 1;

export interface coords {
  x: number;
  y: number;
}

export interface sprite {
  width: number;
  height: number;
}

export interface rect extends coords {
  width: number;
  height: number;
}

export interface objectMapInfo {
  id: string;
  owner: string;
  position: coords;
  radius: number;
  class: string;
  mirror: boolean;
}

export interface objectDisplayInfo {
  id: string;
  owner: string;
  position: coords;
  radius: number;
  class: string;
  mirror?: boolean;
  orbitRadius?: number;
  year?: number;
  day?: number;
  rotationSpeed?: number;
  rotationPeriod?: number;
  orbitCenter?: coords;
  startAngle?: number;
  orbitSpeed?: number;
  hp?: number;
  energy?: number;
}

export interface StarAttackPosition {
  center: coords;
  hold: boolean;
}

export interface ObjectMoveParams {
  type: movings;
  speed?: number;
  target?: coords;
  angle?: number;
  angleSpeed?: number;
  axisSpeed?: number;
  orbitRadius?: number;
}

