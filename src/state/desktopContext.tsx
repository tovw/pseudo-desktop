import move from 'array-move';
import React, {
  createContext,
  FC,
  useContext,
  useMemo,
  useReducer
} from 'react';
import { dragIsInPreviewTriggerArea } from '../utils/dragIsInTriggerArea';
import { Coordinate, Dimensions, UIWindow } from '../utils/types';

export interface DesktopState {
  uiWindows: Record<string, UIWindow>;
  desktopZindexes: string[];
  taskBarIconOrder: string[];
  activeWindowId?: string;
  desktopDimensions: Dimensions;
  taskbarIconSideLength: number;
  taskbarIconMargin: number;
  showResizePreview?: {
    dimensions: Dimensions;
    triggeredFrom: Coordinate;
    toCoordinate: Coordinate;
  };
  resizePreviewCornerTriggerArea: number;
  resizePreviewSideTriggerArea: number;
  desktopWindowMinSize: number;
}

const initialState: DesktopState = {
  resizePreviewCornerTriggerArea: 50,
  resizePreviewSideTriggerArea: 25,
  desktopWindowMinSize: 100,
  desktopZindexes: ['1', '2'],
  taskBarIconOrder: ['3', '4'],
  desktopDimensions: {
    height: 0,
    width: 0
  },
  showResizePreview: undefined,
  taskbarIconSideLength: 80,
  taskbarIconMargin: 10,
  activeWindowId: undefined,
  uiWindows: {
    '1': {
      id: '1',
      topLeftPosition: { x: 100, y: 200 },
      dimensions: { width: 300, height: 300 },
      color: '#A5DD97',
      animateInFrom: undefined
    },
    '2': {
      id: '2',
      topLeftPosition: { y: 311, x: 231 },
      dimensions: { width: 123, height: 234 },
      color: '#95A9F2',
      animateInFrom: undefined
    },
    '3': {
      id: '3',
      topLeftPosition: { y: 111, x: 231 },
      dimensions: { width: 123, height: 234 },
      color: '#F093AE',
      animateInFrom: undefined
    },
    '4': {
      id: '4',
      topLeftPosition: { y: 221, x: 291 },
      dimensions: { width: 90, height: 400 },
      color: '#F0C996',
      animateInFrom: undefined
    }
  }
};

export enum ActionTypes {
  DRAG_START,
  DRAG,
  DRAG_END,
  SET_DESKTOP_DIMENSIONS,
  RESIZE_START,
  RESIZE,
  RESIZE_END,
  BRING_TO_FRONT
}

export type Action =
  | { type: ActionTypes.DRAG_START; payload: { id: string } }
  | { type: ActionTypes.DRAG; payload: { coordinate: Coordinate } }
  | {
      type: ActionTypes.DRAG_END;
      payload: { coordinate: Coordinate; offsets: Coordinate };
    }
  | {
      type: ActionTypes.SET_DESKTOP_DIMENSIONS;
      payload: { dimensions: Dimensions };
    }
  | { type: ActionTypes.RESIZE_START; payload: { id: string } }
  | { type: ActionTypes.RESIZE; payload: { coordinate: Coordinate } }
  | {
      type: ActionTypes.RESIZE_END;
      payload: {};
    }
  | { type: ActionTypes.BRING_TO_FRONT; payload: { id: string } };

const assertNever = (x: never): never => {
  throw new Error('Invalid Action: ' + x);
};

export const TASKBAR_POSITION_PLACEHOLDER = 'TASKBAR_POSITION_PLACEHOLDER';

const moveItemToLast = <T extends {}>(array: T[], item: T) => {
  const other = array.filter(idx => idx !== item);
  return other.length === array.length ? array : [...other, item];
};

const dragOriginIsDesktop = (
  desktopZindexes: string[],
  draggingWindowId?: string
) => desktopZindexes.some(idx => idx === draggingWindowId);

const dragIsInTaskBar = (
  taskbarIconSideLength: number,
  taskbarIconMargin: number,
  dragY: number
) => taskbarIconMargin * 2 + taskbarIconSideLength >= dragY;

const getTaskbarIconIndex = (
  taskbarIconMargin: number,
  taskbarIconSideLength: number,
  taskbarIconsCount: number,
  dragX: number
) =>
  Math.abs(
    Math.min(
      taskbarIconsCount - 1,
      Math.ceil(
        (dragX - taskbarIconMargin - 0.5 * taskbarIconSideLength) /
          (taskbarIconMargin + taskbarIconSideLength)
      )
    )
  );

const adjustTaskbarIconOrder = (state: DesktopState, drag: Coordinate) => {
  const {
    taskbarIconSideLength: l,
    taskbarIconMargin: m,
    taskBarIconOrder,
    activeWindowId: draggingWindowId
  } = state;
  const token = taskBarIconOrder.some(id => id === draggingWindowId)
    ? draggingWindowId
    : TASKBAR_POSITION_PLACEHOLDER;

  const oldIndex = taskBarIconOrder.findIndex(id => id === token);

  if (dragIsInTaskBar(l, m, drag.y)) {
    const newIndex = getTaskbarIconIndex(m, l, taskBarIconOrder.length, drag.x);
    return newIndex === oldIndex
      ? taskBarIconOrder
      : move(taskBarIconOrder, oldIndex, newIndex);
  } else {
    return oldIndex === taskBarIconOrder.length - 1
      ? taskBarIconOrder
      : moveItemToLast(taskBarIconOrder, token as string);
  }
};

const updateWindowPosition = (
  uiWindow: UIWindow,
  coordinate: Coordinate,
  offsets: Coordinate,
  dragPreview?: {
    dimensions: Dimensions;
    triggeredFrom: Coordinate;
    toCoordinate: Coordinate;
  }
) => {
  return dragPreview
    ? {
        ...uiWindow,
        topLeftPosition: dragPreview.toCoordinate,
        dimensions: dragPreview.dimensions
      }
    : {
        ...uiWindow,
        topLeftPosition: {
          x: coordinate.x - offsets.x,
          y: coordinate.y - offsets.y
        }
      };
};

const dragEnd = (
  state: DesktopState,
  drag: Coordinate,
  offsets: Coordinate
) => {
  if (!state.activeWindowId) return state;
  //from bar to desktop
  const {
    taskBarIconOrder,
    taskbarIconMargin: m,
    taskbarIconSideLength: l,
    desktopZindexes,
    activeWindowId: draggingWindowId
  } = state;
  const originDesktop = dragOriginIsDesktop(desktopZindexes, draggingWindowId);
  const releaseInTaskbar = dragIsInTaskBar(l, m, drag.y);
  let newZindexes, newWindow, newOrder;

  if (originDesktop) {
    if (releaseInTaskbar) {
      //replace token with id, filter desktopZindexes
      newOrder = adjustTaskbarIconOrder(state, drag).map(id =>
        id !== TASKBAR_POSITION_PLACEHOLDER ? id : draggingWindowId
      );
      newZindexes = desktopZindexes.filter(id => id !== draggingWindowId);
      newWindow = {
        ...state.uiWindows[draggingWindowId],
        animateInFrom: {
          x: drag.x - Math.min(offsets.x, l / 2),
          y: m
        }
      };
    } else {
      //upadte top,left
      newOrder = taskBarIconOrder.filter(
        id => id !== TASKBAR_POSITION_PLACEHOLDER
      );

      newWindow = updateWindowPosition(
        state.uiWindows[draggingWindowId],
        drag,
        offsets,
        state.showResizePreview
      );
    }
  } else {
    if (releaseInTaskbar) {
      //pass
    } else {
      //filter orders
      newOrder = taskBarIconOrder.filter(id => id !== draggingWindowId);
      //zindexes push
      newZindexes = [...desktopZindexes, draggingWindowId];
      //updateTopLeft
      newWindow = updateWindowPosition(
        state.uiWindows[draggingWindowId],
        drag,
        offsets,
        state.showResizePreview
      );
    }
  }
  return {
    ...state,
    taskBarIconOrder: newOrder || state.taskBarIconOrder,
    desktopZindexes: newZindexes || state.desktopZindexes,
    uiWindows: {
      ...state.uiWindows,
      [draggingWindowId]: newWindow || state.uiWindows[draggingWindowId]
    }
  };
};

const resizeWindow = (state: DesktopState, deltas: Coordinate) => {
  const { activeWindowId, uiWindows, desktopWindowMinSize } = state;
  if (!activeWindowId) return state;
  const window = uiWindows[activeWindowId];
  return {
    ...state,
    uiWindows: {
      ...uiWindows,
      [activeWindowId]: {
        ...window,
        dimensions: {
          width: Math.max(
            window.dimensions.width + deltas.x,
            desktopWindowMinSize
          ),
          height: Math.max(
            window.dimensions.height + deltas.y,
            desktopWindowMinSize
          )
        }
      }
    }
  };
};

const vibrate = (pattern: number | number[]) =>
  window.navigator.vibrate(pattern);

const dragVibrate = () => vibrate(30);
const dragEndVibrate = () => vibrate(15);

const desktopReducer = (state: DesktopState, action: Action): DesktopState => {
  switch (action.type) {
    case ActionTypes.DRAG_START:
      dragVibrate();
      return {
        ...state,
        activeWindowId: action.payload.id,
        desktopZindexes: moveItemToLast(
          state.desktopZindexes,
          action.payload.id
        ),
        taskBarIconOrder: dragOriginIsDesktop(
          state.desktopZindexes,
          action.payload.id
        )
          ? [...state.taskBarIconOrder, TASKBAR_POSITION_PLACEHOLDER]
          : state.taskBarIconOrder
      };

    case ActionTypes.DRAG:
      return {
        ...state,
        showResizePreview: dragIsInPreviewTriggerArea(
          action.payload.coordinate,
          state.desktopDimensions,
          state.taskbarIconSideLength + state.taskbarIconMargin * 2,
          state.resizePreviewCornerTriggerArea,
          state.resizePreviewSideTriggerArea
        ),
        taskBarIconOrder: adjustTaskbarIconOrder(
          state,
          action.payload.coordinate
        )
      };

    case ActionTypes.DRAG_END:
      dragEndVibrate();
      return {
        ...state,
        ...dragEnd(state, action.payload.coordinate, action.payload.offsets),
        activeWindowId: undefined,
        showResizePreview: undefined
      };

    case ActionTypes.SET_DESKTOP_DIMENSIONS:
      return {
        ...state,
        desktopDimensions: action.payload.dimensions
      };

    case ActionTypes.RESIZE_START:
      dragVibrate();
      return {
        ...state,
        activeWindowId: action.payload.id,
        desktopZindexes: moveItemToLast(
          state.desktopZindexes,
          action.payload.id
        )
      };

    case ActionTypes.RESIZE:
      return resizeWindow(state, action.payload.coordinate);

    case ActionTypes.RESIZE_END:
      dragEndVibrate();
      return { ...state, activeWindowId: undefined };

    case ActionTypes.BRING_TO_FRONT:
      return {
        ...state,
        desktopZindexes: moveItemToLast(
          state.desktopZindexes,
          action.payload.id
        )
      };

    default:
      return assertNever(action);
  }
};

const DesktopStateContext = createContext<DesktopState>(initialState);
const DesktopDispatchContext = createContext<Actions | null>(null);

export interface Actions {
  dragStart: (id: string) => void;
  drag: (coordinate: Coordinate) => void;
  dragEnd: (coordinate: Coordinate, offsets: Coordinate) => void;
  setDesktopDimensions: (dimensions: Dimensions) => void;
  resizeStart: (id: string) => void;
  resize: (coordinate: Coordinate) => void;
  resizeEnd: () => void;
  bringToFront: (id: string) => void;
}

export const DesktopStateProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(desktopReducer, initialState);
  const actions = useMemo<Actions>(
    () => ({
      dragStart: id =>
        dispatch({ type: ActionTypes.DRAG_START, payload: { id } }),

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
    }),
    [dispatch]
  );

  return (
    <DesktopStateContext.Provider value={state}>
      <DesktopDispatchContext.Provider value={actions}>
        {children}
      </DesktopDispatchContext.Provider>
    </DesktopStateContext.Provider>
  );
};

export const useDesktopState = () => {
  const context = useContext(DesktopStateContext);
  if (context) return context;
  throw new Error('UseStateContext outside of provider!');
};

export const useDesktopActions = () => {
  const context = useContext(DesktopDispatchContext);
  if (context) return context;
  throw new Error('UseStateContext outside of provider!');
};
