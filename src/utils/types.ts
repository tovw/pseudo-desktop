export interface UIWindow {
  id: string;
  color: string;
  dimensions: Dimensions;
  topLeftPosition: Coordinate;
  animateInFrom?: Coordinate;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}
