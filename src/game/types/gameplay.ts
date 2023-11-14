export type GameObjectDictionary<T> = Record<string, T>;

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
}

