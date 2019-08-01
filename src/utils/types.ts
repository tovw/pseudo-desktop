export type Maybe<T> = T | undefined | null;

export interface UIWindow {
  id: string;
  color: string;
  height: number;
  width: number;
  left: number;
  top: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}
