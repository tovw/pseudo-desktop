import React, { FC, useState } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { Actions } from '../state/desktopContext';
import styled from '../theme';
import { Coordinate, Maybe } from '../utils/types';
import { DragInfoProps, WindowProps } from './DesktopWindow';

const StyledTaskbarIcon = styled.div<WindowProps & DragInfoProps>`
  border-radius: ${p =>
    !p.isDragging || p.isDragInTaskbar
      ? p.theme.taskbarIcon.borderRadius
      : p.theme.desktopWindow.borderRadius};
  height: ${p =>
    !p.isDragging || p.isDragInTaskbar
      ? p.theme.taskbarIcon.iconSideLength
      : p.uiWindow.height}px;
  width: ${p =>
    !p.isDragging || p.isDragInTaskbar
      ? p.theme.taskbarIcon.iconSideLength
      : p.uiWindow.width}px;
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
    paddingTop = 0,
    transition = 'padding 0.2s, transform 0.2s';

  if (drag && offsets) {
    transition = 'padding 0.2s';
    if (drag.y > 100) {
      paddingTop = offsets.y - 10;
      transform = `translateX(${drag.x - offsets.x}px) translateY(${drag.y -
        offsets.y}px)`;
    } else {
      console.log(drag.x, offsets.x, drag.x - offsets.x);
      transform = `translateX(${drag.x - offsets.x}px) translateY(${10}px)`;
    }
  }
  return { transform, paddingTop, transition };
};

export const TaskbarIcon: FC<WindowProps & { order: number } & Actions> = ({
  order,
  dragStart,
  dragEnd,
  drag: d,
  ...rest
}) => {
  const [offsets, setOffsets] = useState<Maybe<Coordinate>>();
  const [drag, setDrag] = useState<Maybe<Coordinate>>();

  const onStart: DraggableEventHandler = (e, { x, y }) => {
    console.log(x, y, { x: x - (80 * order + (1 + order) * 10), y: y - 10 });
    setOffsets({ x: x - (80 * order + (1 + order) * 10), y: y - 10 });
    dragStart(rest.uiWindow.id);
  };

  const onDrag: DraggableEventHandler = (e, { x, y }) => {
    setDrag({ x, y });
    d({ x, y });
  };

  const onStop: DraggableEventHandler = (e, { x, y }) => {
    dragEnd({ x, y }, offsets || { x: 0, y: 0 });
    setDrag(undefined);
    setOffsets(undefined);
  };

  const props = {
    isDragInTaskbar: !!drag && drag.y < 100,

    isDragging: !!offsets
  };

  return (
    <DraggableCore onStart={onStart} onDrag={onDrag} onStop={onStop}>
      <DragContainer
        isDragging={!!offsets}
        style={getPositionStyle(order, drag, offsets)}
      >
        <StyledTaskbarIcon {...props} {...rest}>
          <div></div>
          <div></div>
        </StyledTaskbarIcon>
      </DragContainer>
    </DraggableCore>
  );
};

const DragContainer = styled.span<{ isDragging: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  transition: padding 0.2s;
  z-index: ${p => (p.isDragging ? 99 : 0)};
`;
