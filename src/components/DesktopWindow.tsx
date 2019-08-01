import React, { FC, useState } from 'react';
import styled from '../theme';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { UIWindow, Maybe, Coordinate } from '../utils/types';

export interface WindowProps {
  uiWindow: UIWindow;
}

export interface DragHandlesProps {
  updatePosition: (id: string, top: number, left: number) => void;
}

export interface DragInfoProps {
  isDragging: boolean;
  isDragInTaskbar: boolean;
}

const getPositionStyle = (
  left: number,
  top: number,
  drag: Maybe<{ y: number; x: number }>
) => {
  let transform = `translateX(${left}px) translateY(${top}px)`,
    paddingLeft = 0;

  if (drag && drag.y < 100) {
    transform = `translateX(${left}px) translateY(${10}px)`;
    paddingLeft = drag.x - left - 40;
  }
  return { transform, paddingLeft };
};

export const DesktopWindow: FC<WindowProps & DragHandlesProps> = ({
  uiWindow,
  updatePosition,
  ...rest
}) => {
  const [offsets, setOffsets] = useState<Maybe<Coordinate>>();
  const [drag, setDrag] = useState<Maybe<Coordinate>>();

  const onStart: DraggableEventHandler = (e, { x, y }) => {
    setOffsets({ x: x - uiWindow.left, y: y - uiWindow.top });
    console.log('start');
  };

  const onDrag: DraggableEventHandler = (e, { x, y }) => {
    const { x: ox, y: oy } = offsets || { x: 0, y: 0 };
    setDrag({ x, y });
    updatePosition(uiWindow.id, x - ox, y - oy);
  };

  const onStop: DraggableEventHandler = (e, { x, y }) => {
    const { x: ox, y: oy } = offsets || { x: 0, y: 0 };
    updatePosition(uiWindow.id, x - ox, y - oy);
    setDrag(undefined);
    setOffsets(undefined);
  };

  const props = {
    isDragInTaskbar: !!drag && drag.y < 100,
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
        style={getPositionStyle(uiWindow.left, uiWindow.top, drag)}
      >
        <StyledWindowContainer {...props} {...rest}>
          <StyledWindowHeader {...props} className="header" />
          <StyledWindowBody {...props} />
        </StyledWindowContainer>
      </DragContainer>
    </DraggableCore>
  );
};

export const DragContainer = styled.span`
  position: absolute;
  left: 0;
  top: 0;
  transition: padding 0.2s;
`;

const StyledWindowContainer = styled.div<WindowProps & DragInfoProps>`
  width: ${p => (p.isDragInTaskbar ? 80 : p.uiWindow.width)}px;
  height: ${p => (p.isDragInTaskbar ? 80 : p.uiWindow.height)}px;
  overflow: hidden;
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
