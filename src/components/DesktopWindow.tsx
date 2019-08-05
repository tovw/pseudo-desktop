import React, { FC, useState } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { Actions } from '../state/desktopContext';
import styled from '../theme';
import { Coordinate, Maybe, UIWindow } from '../utils/types';
import { DragContainer } from './DragContainer';

export interface WindowProps {
  uiWindow: UIWindow;
}

export interface DragInfoProps {
  isDragging: boolean;
  isDragInTaskbar: boolean;
}

export interface ZIndexProps {
  zIndex: number;
}

const getPositionStyle = (
  { x, y }: Coordinate,
  drag: Maybe<Coordinate>,
  offsets: Maybe<Coordinate>
) => {
  let transform = `translateX(${x}px) translateY(${y}px)`,
    paddingLeft = 0;

  if (drag && offsets) {
    if (drag.y < 100) {
      transform = `translateX(${drag.x - offsets.x}px) translateY(${10}px)`;
      paddingLeft = offsets.x - 40;
    } else {
      transform = `translateX(${drag.x - offsets.x}px) translateY(${drag.y -
        offsets.y}px)`;
    }
  }
  return { transform, paddingLeft };
};

export const DesktopWindow: FC<WindowProps & Actions & ZIndexProps> = ({
  uiWindow,
  uiWindow: { topLeftPosition, id },
  drag,
  dragStart,
  dragEnd,
  ...rest
}) => {
  const [offsets, setOffsets] = useState<Maybe<Coordinate>>();
  const [dragCoordinate, setDrag] = useState<Maybe<Coordinate>>();

  const onStart: DraggableEventHandler = (e, { x, y }) => {
    setOffsets({ x: x - topLeftPosition.x, y: y - topLeftPosition.y });
    dragStart(id);
  };

  const onDrag: DraggableEventHandler = (e, { x, y }) => {
    setDrag({ x, y });
    drag({ x, y });
  };

  const onStop: DraggableEventHandler = (e, { x, y }) => {
    dragEnd({ x, y }, offsets || { x: 0, y: 0 });
    setDrag(undefined);
    setOffsets(undefined);
  };

  const props = {
    isDragInTaskbar: !!dragCoordinate && dragCoordinate.y < 100,
    uiWindow,
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
        style={getPositionStyle(topLeftPosition, dragCoordinate, offsets)}
      >
        <StyledWindowContainer {...props} {...rest}>
          <StyledWindowHeader {...props} className="header" />
          <StyledWindowBody {...props} />
        </StyledWindowContainer>
      </DragContainer>
    </DraggableCore>
  );
};

const StyledWindowContainer = styled.div<
  WindowProps & DragInfoProps & ZIndexProps
>`
  width: ${p => (p.isDragInTaskbar ? 80 : p.uiWindow.dimensions.width)}px;
  height: ${p => (p.isDragInTaskbar ? 80 : p.uiWindow.dimensions.height)}px;
  overflow: hidden;
  z-index: ${p => p.zIndex};
  border-radius: ${p =>
    p.isDragInTaskbar
      ? p.theme.taskbarIcon.borderRadius
      : p.theme.desktopWindow.borderRadius};
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
`;

const StyledWindowHeader = styled.div<WindowProps & DragInfoProps>`
  max-height: ${p =>
    p.isDragInTaskbar ? '100%' : p.theme.desktopWindow.headerHeight};
  flex: auto;
  opacity: ${p => p.theme.desktopWindow.headerOpacity};
  background: ${p => p.uiWindow.color};
  transition: max-height 0.3s;
`;

const StyledWindowBody = styled.div<WindowProps & DragInfoProps>`
  flex: auto;
  opacity: ${p => p.theme.desktopWindow.bodyOpacity};
  background: ${p => p.uiWindow.color};
`;
