import React, { FC, useContext, useState, useEffect, memo } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { ThemeContext } from 'styled-components';
import { Actions } from '../state/desktopContext';
import styled, { Theme } from '../theme';
import { Coordinate, Maybe } from '../utils/types';
import { DragInfoProps, UIWindowProps, OrderProps } from './DesktopWindow';
import { DragContainer } from './DragContainer';

const StyledTaskbarIcon = styled.div<UIWindowProps & DragInfoProps>`
  border-radius: ${p =>
    !p.isDragging || p.isDragInTaskbar
      ? p.theme.taskbarIcon.borderRadius
      : p.theme.desktopWindow.borderRadius};

  height: ${p =>
    !p.isDragging || p.isDragInTaskbar
      ? p.theme.taskbarIcon.iconSideLength
      : p.uiWindow.dimensions.height}px;

  width: ${p =>
    !p.isDragging || p.isDragInTaskbar
      ? p.theme.taskbarIcon.iconSideLength
      : p.uiWindow.dimensions.width}px;

  overflow: hidden;
  position: absolute;
  display: flex;
  flex-direction: column;

  transition: width 0.2s, height 0.2s;

  > * {
    background: ${p => p.uiWindow.color};
    flex: auto;
    pointer-events: none;
  }
  > :first-child {
    max-height: ${p =>
      !p.isDragging || p.isDragInTaskbar
        ? '100%'
        : p.theme.desktopWindow.headerHeight};
    transition: max-height 0.2s;
  }
  > :last-child {
    opacity: ${p => p.theme.taskbarIcon.bottomHalfOpacity};
  }
`;

const getTaskbarPositionStyle = (
  order: number,
  drag: Maybe<{ y: number; x: number }>,
  offsets: Maybe<{ y: number; x: number }>,
  taskbarIconMargin: number,
  taskbarIconSideLength: number
) => {
  const dragInTaskbar =
    drag && drag.y < 2 * taskbarIconMargin + taskbarIconSideLength;

  const tx =
    drag && offsets
      ? drag.x - offsets.x
      : taskbarIconSideLength * order + (1 + order) * taskbarIconMargin;

  const ty =
    !drag || dragInTaskbar ? taskbarIconMargin : drag.y - taskbarIconMargin;

  const transform = `translateX(${tx}px) translateY(${ty}px)`;
  const transition = drag ? '' : 'transform 0.2s ease-in-out';
  const zIndex = drag ? 99 : undefined;

  return { transform, transition, zIndex };
};

export const TaskbarIcon: FC<UIWindowProps & OrderProps & Actions> = memo(
  ({ order, dragStart, dragEnd, drag: d, uiWindow }) => {
    const [offsets, setOffsets] = useState<Maybe<Coordinate>>();
    const [drag, setDrag] = useState<Maybe<Coordinate>>();
    const {
      taskbarIcon: { iconSideLength, iconMargin }
    } = useContext<Theme>(ThemeContext);

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
      isDragInTaskbar: !!drag && drag.y < 2 * iconMargin + iconSideLength,
      isDragging: !!offsets
    };

    const [animateInTimeout, setA] = useState(true);

    let positionStyle =
      animateInTimeout && uiWindow.animateInFrom
        ? {
            transform: `translateX(${uiWindow.animateInFrom.x}px) translateY(10px)`,
            transition: '0.2s ease-in-out'
          }
        : getTaskbarPositionStyle(
            order,
            drag,
            offsets,
            iconMargin,
            iconSideLength
          );

    useEffect(() => {
      setTimeout(() => setA(false), 0);
    }, []);

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
