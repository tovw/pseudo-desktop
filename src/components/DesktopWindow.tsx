import React, { FC, useState, memo, useContext } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { Actions } from '../state/desktopContext';
import styled, { Theme } from '../theme';
import { Coordinate, Maybe, UIWindow } from '../utils/types';
import { DragContainer } from './DragContainer';
import { ThemeContext } from 'styled-components';

const StyledWindowContainer = styled.div<DragInfoProps & UIWindowProps>`
  width: ${p => (p.isDragInTaskbar ? 80 : p.uiWindow.dimensions.width)}px;
  height: ${p => (p.isDragInTaskbar ? 80 : p.uiWindow.dimensions.height)}px;
  overflow: hidden;

  border-radius: ${p =>
    p.isDragInTaskbar
      ? p.theme.taskbarIcon.borderRadius
      : p.theme.desktopWindow.borderRadius};
  box-shadow: ${p =>
    p.isDragging
      ? p.isDragInTaskbar
        ? ''
        : p.theme.elevation.high
      : p.theme.elevation.low};
  display: flex;
  flex-direction: column;
  transition: all 0.3s;

  > * {
    background: ${p => p.uiWindow.color};
    flex: auto;
  }
  > :first-child {
    max-height: ${p =>
      p.isDragInTaskbar ? '100%' : p.theme.desktopWindow.headerHeight};

    transition: max-height 0.2s;
    opacity: ${p => p.theme.desktopWindow.headerOpacity};
  }
  > :last-child {
    opacity: ${p => p.theme.desktopWindow.bodyOpacity};
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

const getDesktopPositionStyle = (
  windowPosition: Coordinate,
  drag: Maybe<Coordinate>,
  offsets: Maybe<Coordinate>,
  taskbarIconMargin: number,
  taskbarIconSideLength: number
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

export const DesktopWindow: FC<UIWindowProps & Actions> = memo(
  ({
    uiWindow,
    uiWindow: { topLeftPosition, id },
    drag,
    dragStart,
    dragEnd
  }) => {
    const [offsets, setOffsets] = useState<Maybe<Coordinate>>();
    const [dragCoordinate, setDrag] = useState<Maybe<Coordinate>>();
    const {
      taskbarIcon: { iconSideLength, iconMargin }
    } = useContext<Theme>(ThemeContext);

    const onStart: DraggableEventHandler = (_, { x, y }) => {
      setOffsets({ x: x - topLeftPosition.x, y: y - topLeftPosition.y });
      dragStart(id);
    };

    const onDrag: DraggableEventHandler = (_, { x, y }) => {
      setDrag({ x, y });
      drag({ x, y });
    };

    const onStop: DraggableEventHandler = (_, { x, y }) => {
      dragEnd({ x, y }, offsets || { x: 0, y: 0 });
      setDrag(undefined);
      setOffsets(undefined);
    };

    const dragInfoProps = {
      isDragInTaskbar: !!dragCoordinate && dragCoordinate.y < 100,
      isDragging: !!offsets
    };

    return (
      <DraggableCore
        onStart={onStart}
        onDrag={onDrag}
        onStop={onStop}
        handle=".header"
      >
        <DragContainer
          style={getDesktopPositionStyle(
            topLeftPosition,
            dragCoordinate,
            offsets,
            iconMargin,
            iconSideLength
          )}
        >
          <StyledWindowContainer {...dragInfoProps} uiWindow={uiWindow}>
            <div className="header"></div>
            <div></div>
          </StyledWindowContainer>
        </DragContainer>
      </DraggableCore>
    );
  }
);

DesktopWindow.displayName = 'DesktopWindow';
