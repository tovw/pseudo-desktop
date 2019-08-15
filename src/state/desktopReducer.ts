import move from 'array-move';
import { ResizePreviewProps } from '../components/ResizePreview';
import { getResizePreview } from '../utils/getResizePreview';
import { Coordinate, Dimensions, UIWindow } from '../utils/types';
import { Action, ActionTypes } from './desktopActions';

export const TASKBAR_POSITION_PLACEHOLDER = 'TASKBAR_POSITION_PLACEHOLDER';

//Helpers
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

function dragEndChange(
  state: DesktopState,
  drag: Coordinate,
  offsets: Coordinate
) {
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

function resizeWindow(state: DesktopState, deltas: Coordinate) {
  const oldWindow = state.uiWindows[state.activeWindowId!];
  const { width, height } = oldWindow.dimensions;
  return {
    ...state,
    uiWindows: {
      ...state.uiWindows,
      [state.activeWindowId!]: {
        ...oldWindow,
        dimensions: {
          width: Math.max(width + deltas.x, state.desktopWindowMinSize),
          height: Math.max(height + deltas.y, state.desktopWindowMinSize)
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

function dragStart(state: DesktopState, { id }: { id: string }) {
  dragStartVibrate();
  return {
    ...state,
    activeWindowId: id,
    desktopZindexes: moveUniqueItemToTail(state.desktopZindexes, id),
    taskBarIconOrder: dragOriginIsDesktop(state.desktopZindexes, id)
      ? [...state.taskBarIconOrder, TASKBAR_POSITION_PLACEHOLDER]
      : state.taskBarIconOrder
  };
}

function drag(state: DesktopState, { coordinate }: { coordinate: Coordinate }) {
  return {
    ...state,
    taskBarIconOrder: getTaskbarIconOrder(state, coordinate),
    showResizePreview: getResizePreview(
      coordinate,
      state.desktopDimensions,
      state.taskbarIconSideLength + state.taskbarIconMargin * 2,
      state.resizePreviewCornerTriggerArea,
      state.resizePreviewSideTriggerArea
    )
  };
}

function resizeStart(state: DesktopState, { id }: { id: string }) {
  dragStartVibrate();
  return {
    ...state,
    activeWindowId: id,
    desktopZindexes: moveUniqueItemToTail(state.desktopZindexes, id)
  };
}

function dragEnd(
  state: DesktopState,
  { coordinate, offsets }: { coordinate: Coordinate; offsets: Coordinate }
) {
  dragEndVibrate();
  return {
    ...state,
    ...dragEndChange(state, coordinate, offsets),
    activeWindowId: undefined,
    showResizePreview: undefined
  };
}

function bringWindowToFront(state: DesktopState, { id }: { id: string }) {
  return {
    ...state,
    desktopZindexes: moveUniqueItemToTail(state.desktopZindexes, id)
  };
}

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
      topLeftPosition: { x: 30, y: 200 },
      dimensions: { width: 300, height: 300 },
      color: '#A5DD97',
      animateInFrom: undefined
    },
    '2': {
      id: '2',
      topLeftPosition: { y: 350, x: 225 },
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

export const desktopReducer = (
  state: DesktopState,
  action: Action
): DesktopState => {
  switch (action.type) {
    case ActionTypes.DRAG_START:
      return dragStart(state, action.payload);

    case ActionTypes.DRAG:
      return drag(state, action.payload);

    case ActionTypes.DRAG_END:
      return dragEnd(state, action.payload);

    case ActionTypes.SET_DESKTOP_DIMENSIONS: {
      return {
        ...state,
        desktopDimensions: action.payload.dimensions
      };
    }

    case ActionTypes.RESIZE_START:
      return resizeStart(state, action.payload);

    case ActionTypes.RESIZE:
      return resizeWindow(state, action.payload.coordinate);

    case ActionTypes.RESIZE_END: {
      dragEndVibrate();
      return { ...state, activeWindowId: undefined };
    }

    case ActionTypes.BRING_TO_FRONT:
      return bringWindowToFront(state, action.payload);

    case ActionTypes.SET_ICON_THEME_VARIABLES: {
      return { ...state, ...action.payload };
    }

    default:
      return assertNever(action);
  }
};
