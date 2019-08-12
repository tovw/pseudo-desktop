import { Coordinate, Dimensions } from '../utils/types';
import { Dispatch } from 'react';

export enum ActionTypes {
  DRAG_START,
  DRAG,
  DRAG_END,
  SET_DESKTOP_DIMENSIONS,
  RESIZE_START,
  RESIZE,
  RESIZE_END,
  BRING_TO_FRONT,
  SET_ICON_THEME_VARIABLES
}

export type Action =
  | {
      type: ActionTypes.DRAG_START;
      payload: {
        id: string;
      };
    }
  | {
      type: ActionTypes.DRAG;
      payload: {
        coordinate: Coordinate;
      };
    }
  | {
      type: ActionTypes.DRAG_END;
      payload: {
        coordinate: Coordinate;
        offsets: Coordinate;
      };
    }
  | {
      type: ActionTypes.SET_DESKTOP_DIMENSIONS;
      payload: {
        dimensions: Dimensions;
      };
    }
  | {
      type: ActionTypes.RESIZE_START;
      payload: {
        id: string;
      };
    }
  | {
      type: ActionTypes.RESIZE;
      payload: {
        coordinate: Coordinate;
      };
    }
  | {
      type: ActionTypes.RESIZE_END;
      payload: {};
    }
  | {
      type: ActionTypes.BRING_TO_FRONT;
      payload: {
        id: string;
      };
    }
  | {
      type: ActionTypes.SET_ICON_THEME_VARIABLES;
      payload: {
        taskbarIconSideLength: number;
        taskbarIconMargin: number;
      };
    };

export interface DesktopActionCreators {
  dragStart: (id: string) => void;
  drag: (coordinate: Coordinate) => void;
  dragEnd: (coordinate: Coordinate, offsets: Coordinate) => void;
  setDesktopDimensions: (dimensions: Dimensions) => void;
  resizeStart: (id: string) => void;
  resize: (coordinate: Coordinate) => void;
  resizeEnd: () => void;
  bringToFront: (id: string) => void;
}

export const actionCreators = (
  dispatch: Dispatch<Action>
): DesktopActionCreators => ({
  dragStart: id => dispatch({ type: ActionTypes.DRAG_START, payload: { id } }),

  drag: coordinate =>
    dispatch({ type: ActionTypes.DRAG, payload: { coordinate } }),

  dragEnd: (coordinate, offsets) =>
    dispatch({
      type: ActionTypes.DRAG_END,
      payload: { coordinate, offsets }
    }),

  setDesktopDimensions: dimensions =>
    dispatch({
      type: ActionTypes.SET_DESKTOP_DIMENSIONS,
      payload: { dimensions }
    }),

  resizeStart: id =>
    dispatch({ type: ActionTypes.RESIZE_START, payload: { id } }),

  resize: coordinate =>
    dispatch({ type: ActionTypes.RESIZE, payload: { coordinate } }),

  resizeEnd: () =>
    dispatch({
      type: ActionTypes.RESIZE_END,
      payload: {}
    }),

  bringToFront: id =>
    dispatch({
      type: ActionTypes.BRING_TO_FRONT,
      payload: { id }
    })
});
