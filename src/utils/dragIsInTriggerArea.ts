import { Coordinate, Dimensions, Maybe } from './types';

export const dragIsInPreviewTriggerArea = (
  triggeredFrom: Coordinate,
  dimensions: Dimensions,
  taskbarBottomEdge: number,
  cornerTriggerAreaSide: number,
  sideTriggerAreaSide: number
): Maybe<{
  dimensions: Dimensions;
  triggeredFrom: Coordinate;
  toCoordinate: Coordinate;
}> => {
  const { x, y } = triggeredFrom;
  const { width: w, height: h } = dimensions;
  const leftCorner = x < cornerTriggerAreaSide;
  const rightCorner = x > w - cornerTriggerAreaSide;
  const topCorner = y < taskbarBottomEdge + cornerTriggerAreaSide;
  const bottomCorner = y > h - cornerTriggerAreaSide;
  const leftSide = x < sideTriggerAreaSide;
  const rightSide = x > w - sideTriggerAreaSide;
  const bottomSide = y > h - sideTriggerAreaSide;
  const topSide = y < taskbarBottomEdge + sideTriggerAreaSide;
  const underTopBar = y > taskbarBottomEdge;

  if (leftCorner && topCorner && underTopBar) {
    return {
      toCoordinate: { x: 0, y: 0 },
      dimensions: { width: w / 2, height: (h - taskbarBottomEdge) / 2 },
      triggeredFrom
    };
    //bottom-left
  } else if (leftCorner && bottomCorner) {
    return {
      toCoordinate: {
        x: 0,
        y: (h - taskbarBottomEdge) / 2
      },
      dimensions: { width: w / 2, height: (h - taskbarBottomEdge) / 2 },
      triggeredFrom
    };
    //left-side
  } else if (leftSide && underTopBar) {
    return {
      toCoordinate: { x: 0, y: 0 },
      dimensions: { width: w / 2, height: h - taskbarBottomEdge },
      triggeredFrom
    };
    //bottom-right
  } else if (rightCorner && bottomCorner) {
    return {
      toCoordinate: {
        x: w / 2,
        y: (h - taskbarBottomEdge) / 2
      },
      dimensions: { width: w / 2, height: (h - taskbarBottomEdge) / 2 },
      triggeredFrom
    };
    //top-right
  } else if (rightCorner && topCorner && underTopBar) {
    return {
      toCoordinate: { x: w / 2, y: 0 },
      dimensions: { width: w / 2, height: (h - taskbarBottomEdge) / 2 },
      triggeredFrom
    };
    //right-side
  } else if (rightSide && underTopBar) {
    return {
      toCoordinate: { x: w / 2, y: 0 },
      dimensions: { width: w / 2, height: h - taskbarBottomEdge },
      triggeredFrom
    };
    //bottom
  } else if (bottomSide) {
    return {
      toCoordinate: {
        x: 0,
        y: (h - taskbarBottomEdge) / 2
      },
      dimensions: { width: w, height: (h - taskbarBottomEdge) / 2 },
      triggeredFrom
    };
    //top
  } else if (underTopBar && topSide) {
    return {
      toCoordinate: { x: 0, y: 0 },
      dimensions: { width: w, height: h - taskbarBottomEdge },
      triggeredFrom
    };
  }
  return undefined;
};
