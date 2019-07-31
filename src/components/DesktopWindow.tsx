import React, { FC, useState } from 'react';
import styled from '../theme';
import {
  DraggableCore,
  DraggableEvent,
  DraggableData,
  DraggableEventHandler
} from 'react-draggable';

export interface UIWindow {
  id: string;
  color: string;
  height: number;
  width: number;
  left: number;
  top: number;
}

interface DesktopWindowProps {
  uiWindow: UIWindow;
}

interface DraggableProps {
  updatePosition: (id: string, top: number, left: number) => void;
}

interface StyledDesktopWindowProps {
  isDragging: boolean;
  isDragInTaskbar: boolean;
}

export type Maybe<T> = T | undefined | null;

const getPosition = (
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

export const DesktopWindow: FC<DesktopWindowProps & DraggableProps> = ({
  uiWindow,
  updatePosition,
  ...rest
}) => {
  const [offsets, setOffsets] = useState<Maybe<{ x: number; y: number }>>();
  const [drag, setDrag] = useState<Maybe<{ x: number; y: number }>>();

  const [a, sa] = useState();

  const onStart: DraggableEventHandler = (e, data) => {
    setOffsets({ x: e.clientX - uiWindow.left, y: e.clientY - uiWindow.top });
    console.log('start');
  };

  const onDrag = (e: DraggableEvent, data: DraggableData) => {
    const { x, y } = offsets || { x: 0, y: 0 };
    if (e instanceof MouseEvent) {
      setDrag({ x: e.clientX, y: e.clientY });
      updatePosition(uiWindow.id, e.clientX - x, e.clientY - y);
    }
  };

  const onStop: DraggableEventHandler = () => {
    setOffsets(undefined);
  };

  return (
    <DragContainer style={getPosition(uiWindow.left, uiWindow.top, drag)}>
      <StyledWindowContainer
        isDragging={!!offsets}
        isDragInTaskbar={!!drag && drag.y < 100}
        uiWindow={uiWindow}
        {...rest}
      >
        <DraggableCore onStart={onStart} onDrag={onDrag} onStop={onStop}>
          <StyledWindowHeader
            isDragging={!!offsets}
            isDragInTaskbar={!!drag && drag.y < 100}
            uiWindow={uiWindow}
          ></StyledWindowHeader>
        </DraggableCore>
        <StyledWindowBody
          isDragging={!!offsets}
          isDragInTaskbar={!!drag && drag.y < 100}
          uiWindow={uiWindow}
        ></StyledWindowBody>
      </StyledWindowContainer>
    </DragContainer>
  );
};

const DragContainer = styled.span`
  position: absolute;
  left: 0;
  top: 0;
  transition: padding 0.2s;
`;

const StyledWindowContainer = styled.div<
  DesktopWindowProps & StyledDesktopWindowProps
>`
  width: ${p => (p.isDragInTaskbar ? 80 : p.uiWindow.width)}px;
  height: ${p => (p.isDragInTaskbar ? 80 : p.uiWindow.height)}px;
  overflow: hidden;
  border-radius: ${p => p.theme.desktopWindow.borderRadius};
  display: flex;
  flex-direction: column;
  transition: width 0.3s, height 0.3s;
`;

const StyledWindowHeader = styled.div<
  DesktopWindowProps & StyledDesktopWindowProps
>`
  max-height: ${p => p.theme.desktopWindow.headerHeight};
  flex: auto;
  opacity: ${p => p.theme.desktopWindow.headerOpacity};
  background: ${p => p.uiWindow.color};
`;

const StyledWindowBody = styled.div<
  DesktopWindowProps & StyledDesktopWindowProps
>`
  flex: auto;
  opacity: ${p => p.theme.desktopWindow.bodyOpacity};
  background: ${p => p.uiWindow.color};
`;

/* 
    Positioner
        container
            Draggable-header
            body
                Draggable-resizer 
            
*/
