import move from 'array-move';
import React, {
  createContext,
  FC,
  useContext,
  useReducer,
  useMemo
} from 'react';
import { Coordinate, Dimensions, Maybe, UIWindow } from '../utils/types';
import { dragIsInPreviewTriggerArea } from '../utils/dragIsInTriggerArea';

export interface DesktopState {
  uiWindows: Record<string, UIWindow>;
  desktopZindexes: string[];
  taskBarIconOrder: string[];
  draggingWindowId: Maybe<string>;
  desktopDimensions: Dimensions;
  taskbarIconSideLength: number;
  taskbarIconMargin: number;
  showResizePreview: Maybe<{
    dimensions: Dimensions;
    triggeredFrom: Coordinate;
    toCoordinate: Coordinate;
  }>;
  resizePreviewCornerTriggerArea: number;
  resizePreviewSideTriggerArea: number;
}

const initialState: DesktopState = {
  resizePreviewCornerTriggerArea: 50,
  resizePreviewSideTriggerArea: 25,
  desktopZindexes: ['1', '2'],
  taskBarIconOrder: ['3', '4'],
  desktopDimensions: {
    height: 0,
    width: 0
  },
  showResizePreview: undefined,
  taskbarIconSideLength: 80,
  taskbarIconMargin: 10,
  draggingWindowId: undefined,
  uiWindows: {
    '1': {
      id: '1',
      topLeftPosition: { x: 100, y: 100 },
      dimensions: { width: 300, height: 300 },
      color: 'papayawhip',
      animateInFrom: undefined
    },
    '2': {
      id: '2',
      topLeftPosition: { y: 111, x: 231 },
      dimensions: { width: 123, height: 234 },
      color: 'blue',
      animateInFrom: undefined
    },
    '3': {
      id: '3',
      topLeftPosition: { y: 111, x: 231 },
      dimensions: { width: 123, height: 234 },
      color: 'green',
      animateInFrom: undefined
    },
    '4': {
      id: '4',
      topLeftPosition: { y: 221, x: 291 },
      dimensions: { width: 90, height: 400 },
      color: 'purple',
      animateInFrom: undefined
    }
  }
};

export enum ActionTypes {
  DRAG_START,
  DRAG,
  DRAG_END,
  SET_DESKTOP_DIMENSIONS
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
    };

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
  draggingWindowId: Maybe<string>
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
    draggingWindowId
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
  offsets: Coordinate
) => ({
  ...uiWindow,
  topLeftPosition: {
    x: coordinate.x - offsets.x,
    y: coordinate.y - offsets.y
  }
});

const dragEnd = (
  state: DesktopState,
  drag: Coordinate,
  offsets: Coordinate
) => {
  if (!state.draggingWindowId) return state;
  //from bar to desktop
  const {
    taskBarIconOrder,
    taskbarIconMargin: m,
    taskbarIconSideLength: l,
    desktopZindexes,
    draggingWindowId
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
        offsets
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
        offsets
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

const desktopReducer = (state: DesktopState, action: Action): DesktopState => {
  switch (action.type) {
    case ActionTypes.DRAG_START:
      return {
        ...state,
        draggingWindowId: action.payload.id,
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
      return {
        ...state,
        ...dragEnd(state, action.payload.coordinate, action.payload.offsets),
        draggingWindowId: undefined
      };

    case ActionTypes.SET_DESKTOP_DIMENSIONS:
      return {
        ...state,
        desktopDimensions: action.payload.dimensions
      };
    default:
      return assertNever(action);
  }
};

const DesktopStateContext = createContext<DesktopState>(initialState);
const DesktopDispatchContext = createContext<Maybe<Actions>>(null);

export interface Actions {
  dragStart: (id: string) => void;
  drag: (coordinate: Coordinate) => void;
  dragEnd: (coordinate: Coordinate, offsets: Coordinate) => void;
  setDesktopDimensions: (dimensions: Dimensions) => void;
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
