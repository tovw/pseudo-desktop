import React, { FC, useContext, useState, useEffect, memo } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { ThemeContext } from 'styled-components';
import { useDesktopActions } from '../state/desktopContext';
import styled, { Theme } from '../theme';
import { Coordinate } from '../utils/types';
import { DragInfoProps, UIWindowProps, OrderProps } from './DesktopWindow';
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

  transition: all 0.2 ease-in-out;

  > * {
    background: ${p => p.uiWindow.color};
    flex: auto;
    pointer-events: none;
  }
  > :first-child {
    max-height: ${p =>
      p.noDragOrInTaskbar ? '100%' : p.theme.desktopWindow.headerHeight};
    transition: max-height 0.2s;
  }
  > :last-child {
    opacity: ${p =>
      !p.noDragOrInTaskbar
        ? p.theme.desktopWindow.bodyOpacity + 0.1
        : p.theme.taskbarIcon.bottomHalfOpacity};
  }
`;

const getTaskbarPositionStyle = (
  order: number,
  taskbarIconMargin: number,
  taskbarIconSideLength: number,
  drag?: Coordinate,
  offsets?: Coordinate
) => {
  const dragInTaskbar =
    drag && drag.y < 2 * taskbarIconMargin + taskbarIconSideLength;

  const tx =
    drag && offsets
      ? drag.x - offsets.x
      : (taskbarIconSideLength + taskbarIconMargin) * order + taskbarIconMargin;

  const ty =
    !drag || dragInTaskbar ? taskbarIconMargin : drag.y - taskbarIconMargin;

  const transform = `translateX(${tx}px) translateY(${ty}px)`;
  const transition = drag ? undefined : 'all 0.2s ease-in-out';
  const zIndex = drag ? 99 : undefined;

  return { transform, transition, zIndex, width: 80, height: 80 };
};

const useTaskbarPositionStyle = (
  order: number,
  taskbarIconMargin: number,
  taskbarIconSideLength: number,
  drag?: Coordinate,
  offsets?: Coordinate,
  animateIn?: Coordinate
) => {
  const [isFirstRender, setIsFirstRender] = useState(true);

  const positionStyle =
    isFirstRender && animateIn
      ? {
          transform: `translateX(${animateIn.x}px) translateY(${taskbarIconMargin}px)`,
          transition: 'transform 0.2s ease-in-out'
        }
      : getTaskbarPositionStyle(
          order,
          taskbarIconMargin,
          taskbarIconSideLength,
          drag,
          offsets
        );

  useEffect(() => {
    setTimeout(() => setIsFirstRender(false), 0);
  }, []);

  return positionStyle;
};

export const TaskbarIcon: FC<UIWindowProps & OrderProps> = memo(
  ({ order, uiWindow }) => {
    const [offsets, setOffsets] = useState<Coordinate | undefined>();
    const [drag, setDrag] = useState<Coordinate | undefined>();
    const {
      taskbarIcon: { iconSideLength, iconMargin }
    } = useContext<Theme>(ThemeContext);

    const { dragStart, dragEnd, drag: d } = useDesktopActions();

    const onStart: DraggableEventHandler = (_, { x, y }) => {
      setOffsets({
        x: x - (iconSideLength * order + (1 + order) * iconMargin),
        y: y - iconMargin
      });
      setDrag({ x, y });
      dragStart(uiWindow.id);
    };

    const onDrag: DraggableEventHandler = (_, { x, y }) => {
      setDrag({ x, y });
      d({ x, y });
    };

    const onStop: DraggableEventHandler = (_, { x, y }) => {
      if (!offsets) return;
      dragEnd({ x, y }, { x: offsets.x, y: iconMargin });
      setDrag(undefined);
      setOffsets(undefined);
    };

    const dragInfoProps = {
      isDragging: !!drag,
      isDragInTaskbar: !!drag && drag.y < 2 * iconMargin + iconSideLength
    };

    const positionStyle = useTaskbarPositionStyle(
      order,
      iconMargin,
      iconSideLength,
      drag,
      offsets,
      uiWindow.animateInFrom
    );

    if (uiWindow.id === '3') {
      console.log(positionStyle);
    }

    return (
      <DraggableCore onStart={onStart} onDrag={onDrag} onStop={onStop}>
        <DragContainer style={positionStyle}>
          <StyledTaskbarIcon {...dragInfoProps} uiWindow={uiWindow}>
            <div></div>
            <div></div>
          </StyledTaskbarIcon>
        </DragContainer>
      </DraggableCore>
    );
  }
);

TaskbarIcon.displayName = 'TaskbarIcon';
