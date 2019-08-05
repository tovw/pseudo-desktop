import React, { FC, useContext, useState, useEffect, memo } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { ThemeContext } from 'styled-components';
import { Actions } from '../state/desktopContext';
import styled, { Theme } from '../theme';
import { Coordinate, Maybe } from '../utils/types';
import { DragInfoProps, WindowProps } from './DesktopWindow';
import { DragContainer } from './DragContainer';

const StyledTaskbarIcon = styled.div<WindowProps & DragInfoProps>`
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
  z-index: ${p => (p.isDragging ? 99 : 0)};
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

const getPositionStyle = (
  index: number,
  drag: Maybe<{ y: number; x: number }>,
  offsets: Maybe<{ y: number; x: number }>
) => {
  let transform = `translateX(${80 * index +
      (1 + index) * 10}px) translateY(${10}px)`,
    transition = 'transform 0.2s ease-in-out';

  if (drag && offsets) {
    transition = '';
    if (drag.y > 100) {
      transform = `translateX(${drag.x - offsets.x}px) translateY(${drag.y -
        10}px)`;
    } else {
      console.log(drag.x, offsets.x, drag.x - offsets.x);
      transform = `translateX(${drag.x - offsets.x}px) translateY(${10}px)`;
    }
  }
  return { transform, transition };
};

export const TaskbarIcon: FC<WindowProps & { order: number } & Actions> = memo(
  ({ order, dragStart, dragEnd, drag: d, ...rest }) => {
    const [offsets, setOffsets] = useState<Maybe<Coordinate>>();
    const [drag, setDrag] = useState<Maybe<Coordinate>>();
    const {
      taskbarIcon: { iconSideLength, iconMargin }
    } = useContext<Theme>(ThemeContext);

    const onStart: DraggableEventHandler = (e, { x, y }) => {
      setOffsets({
        x: x - (iconSideLength * order + (1 + order) * iconMargin),
        y: y - iconMargin
      });
      setDrag({ x, y });
      dragStart(rest.uiWindow.id);
    };

    const onDrag: DraggableEventHandler = (e, { x, y }) => {
      setDrag({ x, y });
      d({ x, y });
    };

    const onStop: DraggableEventHandler = (e, { x, y }) => {
      if (!offsets) return;
      dragEnd({ x, y }, { x: offsets.x, y: iconMargin });
      setDrag(undefined);
      setOffsets(undefined);
    };

    const props = {
      isDragInTaskbar: !!drag && drag.y < 2 * iconMargin + iconSideLength,
      isDragging: !!offsets
    };

    const [animateInTimeout, setA] = useState(true);

    let positionStyle =
      animateInTimeout && rest.uiWindow.animateInFrom
        ? {
            transform: `translateX(${rest.uiWindow.animateInFrom.x}px) translateY(10px)`,
            transition: '0.2s ease-in-out'
          }
        : getPositionStyle(order, drag, offsets);

    useEffect(() => {
      setTimeout(() => setA(false), 0);
    }, []);

    return (
      <DraggableCore onStart={onStart} onDrag={onDrag} onStop={onStop}>
        <DragContainer isDragging={!!offsets} style={positionStyle}>
          <StyledTaskbarIcon {...props} {...rest}>
            <div></div>
            <div></div>
          </StyledTaskbarIcon>
        </DragContainer>
      </DraggableCore>
    );
  }
);

TaskbarIcon.displayName = 'TaskbarIcon';
