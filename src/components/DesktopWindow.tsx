import React, { FC, memo, useContext, useState } from 'react';
import { DraggableEventHandler } from 'react-draggable';
import { ThemeContext } from 'styled-components';
import { useDesktopActions } from '../state/DesktopContext';
import styled, { Theme } from '../theme';
import { Coordinate, UIWindow } from '../utils/types';
import { DragContainer } from './DragContainer';
import { Resizer } from './Resizer';

const StyledWindowContainer = styled.div<
  DragInfoProps & UIWindowProps & SiblingActiveProps & { isResizing: boolean }
>`
  width: ${p =>
    p.isResizing
      ? //StyledComps will generate a style for each different number wihtout this
        undefined
      : p.isDragInTaskbar
      ? p.theme.taskbarIcon.iconSideLength
      : p.uiWindow.dimensions.width}px;

  height: ${p =>
    p.isResizing
      ? undefined
      : p.isDragInTaskbar
      ? p.theme.taskbarIcon.iconSideLength
      : p.uiWindow.dimensions.height}px;

  overflow: hidden;

  border-radius: ${p =>
    p.isDragInTaskbar
      ? p.theme.taskbarIcon.borderRadius
      : p.theme.desktopWindow.borderRadius};

  box-shadow: ${p =>
    p.isDragging
      ? p.isDragInTaskbar
        ? undefined
        : p.theme.elevation.high
      : p.theme.elevation.low};

  display: flex;
  position: relative;
  flex-direction: column;
  transition: ${p => (p.isResizing ? '' : 'all 0.3s')};

  filter: ${p => p.isSiblingActive && 'blur(2px)'};

  > * {
    background: ${p => p.uiWindow.color};
    flex: auto;
  }

  .header {
    max-height: ${p =>
      p.isDragInTaskbar ? '100%' : p.theme.desktopWindow.headerHeight};

    transition: max-height 0.2s;

    opacity: ${p =>
      p.theme.desktopWindow.headerOpacity -
      (p.isSiblingActive ? 0.2 : 0) +
      (p.isDragging ? 0.1 : 0)};
  }

  .body {
    opacity: ${p =>
      p.theme.desktopWindow.bodyOpacity -
      (p.isSiblingActive ? 0.2 : 0) +
      (p.isDragging ? 0.1 : 0)};
  }
`;

export interface UIWindowProps {
  uiWindow: UIWindow;
}

export interface DragInfoProps {
  isDragging: boolean;
  isDragInTaskbar: boolean;
}

export interface OrderProps {
  order: number;
}

export interface SiblingActiveProps {
  isSiblingActive: boolean;
}

const getDesktopPositionStyle = (
  windowPosition: Coordinate,
  taskbarIconMargin: number,
  taskbarIconSideLength: number,
  drag?: Coordinate,
  offsets?: Coordinate
) => {
  const dragInTaskbar =
    drag && drag.y < 2 * taskbarIconMargin + taskbarIconSideLength;

  const tx = drag && offsets ? drag.x - offsets.x : windowPosition.x;
  const ty =
    drag && offsets
      ? dragInTaskbar
        ? taskbarIconMargin
        : drag.y - offsets.y
      : windowPosition.y;

  const transform = `translateX(${tx}px) translateY(${ty}px)`;
  const paddingLeft =
    offsets && dragInTaskbar ? offsets.x - taskbarIconSideLength / 2 : 0;
  const zIndex = drag ? 99 : undefined;

  return { transform, paddingLeft, zIndex };
};

export const DesktopWindow: FC<UIWindowProps & SiblingActiveProps> = memo(
  ({
    uiWindow,
    uiWindow: { topLeftPosition, id, dimensions },
    isSiblingActive
  }) => {
    const [offsets, setOffsets] = useState<Coordinate | undefined>();

    const [dragCoordinate, setDragCoordinate] = useState<
      Coordinate | undefined
    >();

    const {
      taskbarIcon: { iconSideLength, iconMargin }
    } = useContext<Theme>(ThemeContext);

    const [isResizing, setIsResizing] = useState(false);

    const {
      drag,
      dragStart,
      dragEnd,
      resizeStart,
      resize,
      resizeEnd,
      bringToFront
    } = useDesktopActions();

    const onStart: DraggableEventHandler = (_, { x, y }) => {
      setOffsets({ x: x - topLeftPosition.x, y: y - topLeftPosition.y });
      dragStart(id);
    };

    const onDrag: DraggableEventHandler = (_, { x, y }) => {
      setDragCoordinate({ x, y });
      drag({ x, y });
    };

    const onStop: DraggableEventHandler = (_, { x, y }) => {
      dragEnd({ x, y }, offsets!);
      setDragCoordinate(undefined);
      setOffsets(undefined);
    };

    const onResizeStart = () => {
      setIsResizing(true);
      resizeStart(id);
    };

    const onResizeEnd = () => {
      setIsResizing(false);
      resizeEnd();
    };

    const onResize: DraggableEventHandler = (_, { deltaX: x, deltaY: y }) =>
      resize({ x, y });

    const onClick = () => bringToFront(id);

    return (
      <DragContainer
        positionStyles={getDesktopPositionStyle(
          topLeftPosition,
          iconMargin,
          iconSideLength,
          dragCoordinate,
          offsets
        )}
        onStart={onStart}
        onDrag={onDrag}
        onStop={onStop}
        handle=".header"
      >
        <StyledWindowContainer
          isDragInTaskbar={
            !!dragCoordinate &&
            dragCoordinate.y < iconMargin * 2 + iconSideLength
          }
          isDragging={!!dragCoordinate}
          uiWindow={uiWindow}
          isSiblingActive={isSiblingActive}
          isResizing={isResizing}
          style={isResizing ? { ...dimensions } : undefined}
        >
          <div className="header"></div>
          <div className="body" onClick={onClick} onTouchStart={onClick}></div>
          <Resizer
            onStart={onResizeStart}
            onDrag={onResize}
            onStop={onResizeEnd}
          />
        </StyledWindowContainer>
      </DragContainer>
    );
  }
);

DesktopWindow.displayName = 'DesktopWindow';
