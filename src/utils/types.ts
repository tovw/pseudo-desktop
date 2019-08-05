export type Maybe<T> = T | undefined | null;

export interface UIWindow {
  id: string;
  color: string;
  dimensions: Dimensions;
  topLeftPosition: Coordinate;
  animateInFrom: Maybe<Coordinate>;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}
