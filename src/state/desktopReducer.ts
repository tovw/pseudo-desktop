import move from 'array-move';
import { ResizePreviewProps } from '../components/ResizePreview';
import { getDragPreview } from '../utils/getDragPreview';
import { Coordinate, Dimensions, UIWindow } from '../utils/types';
import { Action, ActionTypes } from './desktopActions';

export interface DesktopState {
  uiWindows: Record<string, UIWindow>;
  desktopZindexes: string[];
  taskBarIconOrder: string[];
  activeWindowId?: string;
  desktopDimensions: Dimensions;
  taskbarIconSideLength: number;
  taskbarIconMargin: number;
  showResizePreview?: ResizePreviewProps;
  resizePreviewCornerTriggerArea: number;
  resizePreviewSideTriggerArea: number;
  desktopWindowMinSize: number;
}
export const initialState: DesktopState = {
  resizePreviewCornerTriggerArea: 30,
  resizePreviewSideTriggerArea: 15,
  desktopWindowMinSize: 100,
  desktopZindexes: ['1', '2'],
  taskBarIconOrder: ['3', '4'],
  desktopDimensions: {
    height: 0,
    width: 0
  },
  showResizePreview: undefined,
  taskbarIconSideLength: 0,
  taskbarIconMargin: 0,
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
export const TASKBAR_POSITION_PLACEHOLDER = 'TASKBAR_POSITION_PLACEHOLDER';

const assertNever = (x: never): never => {
  throw new Error('Invalid Action: ' + x);
};

function moveUniqueItemToTail<T extends {}>(array: T[], item: T) {
  const index = array.findIndex(o => o === item);
  return index > -1 ? move(array, index, array.length - 1) : array;
}

function dragOriginIsDesktop(
  desktopZindexes: string[],
  draggingWindowId?: string
) {
  return desktopZindexes.some(idx => idx === draggingWindowId);
}

function dragIsInTaskBar(
  taskbarIconSideLength: number,
  taskbarIconMargin: number,
  dragY: number
) {
  return taskbarIconMargin * 2 + taskbarIconSideLength >= dragY;
}

function getTaskbarIconIndex(
  margin: number,
  side: number,
  iconsCount: number,
  dragX: number
) {
  return Math.max(
    Math.min(
      Math.ceil((dragX - margin - 0.5 * side) / (margin + side)),
      iconsCount - 1
    ),
    0
  );
}

function getTaskbarIconOrder(
  {
    taskbarIconSideLength: l,
    taskbarIconMargin: m,
    taskBarIconOrder: order,
    activeWindowId
  }: DesktopState,
  drag: Coordinate
) {
  const oldIndex = order.findIndex(
    id => id === activeWindowId || id === TASKBAR_POSITION_PLACEHOLDER
  );
  return dragIsInTaskBar(l, m, drag.y)
    ? move(order, oldIndex, getTaskbarIconIndex(m, l, order.length, drag.x))
    : move(order, oldIndex, order.length - 1);
}

function updateWindowToPreview(
  uiWindow: UIWindow,
  dragPreview: ResizePreviewProps
) {
  return {
    ...uiWindow,
    topLeftPosition: dragPreview.toCoordinate,
    dimensions: dragPreview.dimensions
  };
}

function updateWindowPosition(
  uiWindow: UIWindow,
  coordinate: Coordinate,
  offsets: Coordinate
) {
  return {
    ...uiWindow,
    topLeftPosition: {
      x: coordinate.x - offsets.x,
      y: coordinate.y - offsets.y
    }
  };
}

function updateWindowOnDragEnd(
  uiWindow: UIWindow,
  coordinate: Coordinate,
  offsets: Coordinate,
  dragPreview?: ResizePreviewProps
) {
  return dragPreview
    ? updateWindowToPreview(uiWindow, dragPreview)
    : updateWindowPosition(uiWindow, coordinate, offsets);
}

function dragFromDesktopToTaskbar(
  state: DesktopState,
  drag: Coordinate,
  offsets: Coordinate
) {
  return {
    taskBarIconOrder: getTaskbarIconOrder(state, drag).map(id =>
      id !== TASKBAR_POSITION_PLACEHOLDER ? id : state.activeWindowId!
    ),
    desktopZindexes: state.desktopZindexes.filter(
      id => id !== state.activeWindowId
    ),
    uiWindows: {
      ...state.uiWindows,
      [state.activeWindowId!]: {
        ...state.uiWindows[state.activeWindowId!],
        animateInFrom: {
          x: drag.x - Math.min(offsets.x, state.taskbarIconSideLength / 2),
          y: state.taskbarIconMargin
        }
      }
    }
  };
}

function dragFromDesktopToDesktop(
  state: DesktopState,
  drag: Coordinate,
  offsets: Coordinate
) {
  return {
    taskBarIconOrder: state.taskBarIconOrder.filter(
      id => id !== TASKBAR_POSITION_PLACEHOLDER
    ),
    uiWindows: {
      ...state.uiWindows,
      [state.activeWindowId!]: updateWindowOnDragEnd(
        state.uiWindows[state.activeWindowId!],
        drag,
        offsets,
        state.showResizePreview
      )
    }
  };
}

function dragFromTaskbarToDesktop(
  state: DesktopState,
  drag: Coordinate,
  offsets: Coordinate
) {
  return {
    taskBarIconOrder: state.taskBarIconOrder.filter(
      id => id !== state.activeWindowId
    ),
    desktopZindexes: [...state.desktopZindexes, state.activeWindowId!],
    uiWindows: {
      ...state.uiWindows,
      [state.activeWindowId!]: updateWindowOnDragEnd(
        state.uiWindows[state.activeWindowId!],
        drag,
        offsets,
        state.showResizePreview
      )
    }
  };
}

function dragEnd(state: DesktopState, drag: Coordinate, offsets: Coordinate) {
  const releaseInTaskbar = dragIsInTaskBar(
    state.taskbarIconSideLength,
    state.taskbarIconMargin,
    drag.y
  );
  const releaseInDesktop = !releaseInTaskbar;
  const fromDesktop = dragOriginIsDesktop(
    state.desktopZindexes,
    state.activeWindowId
  );
  const fromTaskbar = !fromDesktop;

  if (fromDesktop && releaseInTaskbar) {
    return dragFromDesktopToTaskbar(state, drag, offsets);
  }

  if (fromDesktop && releaseInDesktop) {
    return dragFromDesktopToDesktop(state, drag, offsets);
  }

  if (fromTaskbar && releaseInDesktop) {
    return dragFromTaskbarToDesktop(state, drag, offsets);
  }

  return state;
}

function resizeWindow(
  { uiWindows, activeWindowId, desktopWindowMinSize }: DesktopState,
  deltas: Coordinate
) {
  return {
    uiWindows: {
      ...uiWindows,
      [activeWindowId!]: {
        ...uiWindows[activeWindowId!],
        dimensions: {
          width: Math.max(
            uiWindows[activeWindowId!].dimensions.width + deltas.x,
            desktopWindowMinSize
          ),
          height: Math.max(
            uiWindows[activeWindowId!].dimensions.height + deltas.y,
            desktopWindowMinSize
          )
        }
      }
    }
  };
}

function vibrate(time: number | number[]) {
  window.navigator.vibrate(time);
}
function dragStartVibrate() {
  vibrate(30);
}
function dragEndVibrate() {
  vibrate(15);
}

export const desktopReducer = (
  state: DesktopState,
  action: Action
): DesktopState => {
  switch (action.type) {
    case ActionTypes.DRAG_START: {
      dragStartVibrate();
      return {
        ...state,
        activeWindowId: action.payload.id,
        desktopZindexes: moveUniqueItemToTail(
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
    }

    case ActionTypes.DRAG:
      return {
        ...state,
        showResizePreview: getDragPreview(
          action.payload.coordinate,
          state.desktopDimensions,
          state.taskbarIconSideLength + state.taskbarIconMargin * 2,
          state.resizePreviewCornerTriggerArea,
          state.resizePreviewSideTriggerArea
        ),
        taskBarIconOrder: getTaskbarIconOrder(state, action.payload.coordinate)
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
      dragStartVibrate();
      return {
        ...state,
        activeWindowId: action.payload.id,
        desktopZindexes: moveUniqueItemToTail(
          state.desktopZindexes,
          action.payload.id
        )
      };

    case ActionTypes.RESIZE:
      return { ...state, ...resizeWindow(state, action.payload.coordinate) };

    case ActionTypes.RESIZE_END:
      dragEndVibrate();
      return { ...state, activeWindowId: undefined };

    case ActionTypes.BRING_TO_FRONT:
      return {
        ...state,
        desktopZindexes: moveUniqueItemToTail(
          state.desktopZindexes,
          action.payload.id
        )
      };

    case ActionTypes.SET_ICON_THEME_VARIABLES:
      return { ...state, ...action.payload };

    default:
      return assertNever(action);
  }
};
