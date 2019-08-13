import React, { FC, memo, useContext, useEffect, useState } from 'react';
import { DraggableEventHandler } from 'react-draggable';
import { ThemeContext } from 'styled-components';
import { useDesktopActions } from '../state/DesktopContext';
import styled, { Theme } from '../theme';
import { Coordinate } from '../utils/types';
import { DragInfoProps, OrderProps, UIWindowProps } from './DesktopWindow';
import { DragContainer } from './DragContainer';

const StyledTaskbarIcon = styled.div.attrs<UIWindowProps & DragInfoProps>(
  p => ({
    noDragOrInTaskbar: !p.isDragging || p.isDragInTaskbar
  })
)<UIWindowProps & DragInfoProps & { noDragOrInTaskbar?: boolean }>`
  border-radius: ${p =>
    p.noDragOrInTaskbar
      ? p.theme.taskbarIcon.borderRadius
      : p.theme.desktopWindow.borderRadius};

  height: ${p =>
    p.noDragOrInTaskbar
      ? p.theme.taskbarIcon.iconSideLength
      : p.uiWindow.dimensions.height}px;

  width: ${p =>
    p.noDragOrInTaskbar
      ? p.theme.taskbarIcon.iconSideLength
      : p.uiWindow.dimensions.width}px;

  box-shadow: ${p => !p.noDragOrInTaskbar && p.theme.elevation.high};

  overflow: hidden;
  position: absolute;
  display: flex;
  flex-direction: column;

  transition: all 0.3s ease-in-out;

  > * {
    background: ${p => p.uiWindow.color};
    flex: auto;
    pointer-events: none;
  }
  .top {
    max-height: ${p =>
      p.noDragOrInTaskbar ? '100%' : p.theme.desktopWindow.headerHeight};
    opacity: ${p =>
      p.noDragOrInTaskbar
        ? p.theme.taskbarIcon.topHalfOpacity
        : p.theme.desktopWindow.headerOpacity};
    transition: all 0.3s;
  }
  .bottom {
    opacity: ${p =>
      p.noDragOrInTaskbar
        ? p.theme.taskbarIcon.bottomHalfOpacity
        : p.theme.desktopWindow.bodyDragOpacity};
    transition: all 0.3s;
  }
`;

const getIconPositionStyle = (
  order: number,
  taskbarIconMargin: number,
  taskbarIconSideLength: number,
  drag?: Coordinate,
  offsets?: Coordinate
) => {
  const tx =
    drag && offsets
      ? drag.x - offsets.x
      : (taskbarIconSideLength + taskbarIconMargin) * order + taskbarIconMargin;

  const dragInTaskbar =
    drag && drag.y < 2 * taskbarIconMargin + taskbarIconSideLength;

  const ty =
    !drag || dragInTaskbar ? taskbarIconMargin : drag.y - taskbarIconMargin;

  const transform = `translateX(${tx}px) translateY(${ty}px)`;
  const transition = drag ? undefined : 'all 0.3s ease-in-out';
  const zIndex = drag ? 99 : undefined;

  return { transform, transition, zIndex };
};

const useFirstRender = () => {
  //give time to get the initial style to the DOM
  const [isFirstRender, setIsFirstRender] = useState(true);
  useEffect(() => {
    setTimeout(() => setIsFirstRender(false), 0);
  }, []);
  return isFirstRender;
};

const useTaskbarPositionStyle = (
  order: number,
  taskbarIconMargin: number,
  taskbarIconSideLength: number,
  drag?: Coordinate,
  offsets?: Coordinate,
  animateIn?: Coordinate
) =>
  useFirstRender() && animateIn
    ? {
        transform: `translateX(${animateIn.x}px) translateY(${taskbarIconMargin}px)`,
        transition: 'transform 0.2s ease-in-out'
      }
    : getIconPositionStyle(
        order,
        taskbarIconMargin,
        taskbarIconSideLength,
        drag,
        offsets
      );

export const TaskbarIcon: FC<UIWindowProps & OrderProps> = memo(
  ({ order, uiWindow }) => {
    const [offsets, setOffsets] = useState<Coordinate | undefined>();

    const [dragCoordinate, setDragCoordinate] = useState<
      Coordinate | undefined
    >();

    const {
      taskbarIcon: { iconSideLength, iconMargin }
    } = useContext<Theme>(ThemeContext);

    const { dragStart, dragEnd, drag } = useDesktopActions();

    const onStart: DraggableEventHandler = (_, { x, y }) => {
      setOffsets({
        x: x - (iconSideLength * order + (1 + order) * iconMargin),
        y: y - iconMargin
      });
      setDragCoordinate({ x, y });
      dragStart(uiWindow.id);
    };

    const onDrag: DraggableEventHandler = (_, { x, y }) => {
      setDragCoordinate({ x, y });
      drag({ x, y });
    };

    const onStop: DraggableEventHandler = (_, { x, y }) => {
      dragEnd({ x, y }, { x: offsets!.x, y: iconMargin });
      setDragCoordinate(undefined);
      setOffsets(undefined);
    };

    const positionStyle = useTaskbarPositionStyle(
      order,
      iconMargin,
      iconSideLength,
      dragCoordinate,
      offsets,
      uiWindow.animateInFrom
    );

    return (
      <DragContainer
        positionStyles={positionStyle}
        onStart={onStart}
        onDrag={onDrag}
        onStop={onStop}
      >
        <StyledTaskbarIcon
          isDragging={!!dragCoordinate}
          isDragInTaskbar={
            !!dragCoordinate &&
            dragCoordinate.y < 2 * iconMargin + iconSideLength
          }
          uiWindow={uiWindow}
        >
          <div className="top"></div>
          <div className="bottom"></div>
        </StyledTaskbarIcon>
      </DragContainer>
    );
  }
);

TaskbarIcon.displayName = 'TaskbarIcon';
