import { ResizePreviewProps } from '../components/ResizePreview';
import { Coordinate, Dimensions } from './types';

export const getResizePreview = (
  triggeredFrom: Coordinate,
  dimensions: Dimensions,
  taskbarBottomEdge: number,
  cornerTriggerAreaSide: number,
  sideTriggerAreaWidth: number
): ResizePreviewProps | undefined => {
  const { x, y } = triggeredFrom;
  const { width: w, height: h } = dimensions;

  const leftCorner = x < cornerTriggerAreaSide;
  const rightCorner = x > w - cornerTriggerAreaSide;
  const topCorner = y < taskbarBottomEdge + cornerTriggerAreaSide;
  const bottomCorner = y > h - cornerTriggerAreaSide;
  const leftSide = x < sideTriggerAreaWidth;
  const rightSide = x > w - sideTriggerAreaWidth;
  const bottomSide = y > h - sideTriggerAreaWidth;
  const topSide = y < taskbarBottomEdge + sideTriggerAreaWidth;
  const underTopBar = y > taskbarBottomEdge;

  //top-left
  if (leftCorner && topCorner && underTopBar) {
    return {
      toCoordinate: { x: 0, y: taskbarBottomEdge },
      dimensions: { width: w / 2, height: (h - taskbarBottomEdge) / 2 },
      triggeredFrom
    };
    //bottom-left
  } else if (leftCorner && bottomCorner) {
    return {
      toCoordinate: {
        x: 0,
        y: (h - taskbarBottomEdge) / 2 + taskbarBottomEdge
      },
      dimensions: { width: w / 2, height: (h - taskbarBottomEdge) / 2 },
      triggeredFrom
    };
    //left-side
  } else if (leftSide && underTopBar) {
    return {
      toCoordinate: { x: 0, y: taskbarBottomEdge },
      dimensions: { width: w / 2, height: h - taskbarBottomEdge },
      triggeredFrom
    };
    //bottom-right
  } else if (rightCorner && bottomCorner) {
    return {
      toCoordinate: {
        x: w / 2,
        y: (h - taskbarBottomEdge) / 2 + taskbarBottomEdge
      },
      dimensions: { width: w / 2, height: (h - taskbarBottomEdge) / 2 },
      triggeredFrom
    };
    //top-right
  } else if (rightCorner && topCorner && underTopBar) {
    return {
      toCoordinate: { x: w / 2, y: taskbarBottomEdge },
      dimensions: { width: w / 2, height: (h - taskbarBottomEdge) / 2 },
      triggeredFrom
    };
    //right-side
  } else if (rightSide && underTopBar) {
    return {
      toCoordinate: { x: w / 2, y: taskbarBottomEdge },
      dimensions: { width: w / 2, height: h - taskbarBottomEdge },
      triggeredFrom
    };
    //bottom
  } else if (bottomSide) {
    return {
      toCoordinate: {
        x: 0,
        y: (h - taskbarBottomEdge) / 2 + taskbarBottomEdge
      },
      dimensions: { width: w, height: (h - taskbarBottomEdge) / 2 },
      triggeredFrom
    };
    //top
  } else if (underTopBar && topSide) {
    return {
      toCoordinate: { x: 0, y: taskbarBottomEdge },
      dimensions: { width: w, height: h - taskbarBottomEdge },
      triggeredFrom
    };
  }
  return undefined;
};
