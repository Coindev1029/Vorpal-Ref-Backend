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
  owner: string;
  center: coords;
  class: string;
  mirror: boolean;
}
