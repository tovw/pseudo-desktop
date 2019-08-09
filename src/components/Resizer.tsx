import React from 'react';
import { DraggableCore, DraggableCoreProps } from 'react-draggable';
import styled from '../theme';

const StyledBottomRightResizer = styled.div`
  background: rgba(0, 0, 0, 0.1);
  position: absolute;
  right: -3rem;
  bottom: -3rem;
  height: 6rem;
  width: 5rem;
  cursor: se-resize;
  z-index: 1;
  transform: rotate(45deg);
`;

export const Resizer = (props: Partial<DraggableCoreProps>) => (
  <DraggableCore {...props}>
    <StyledBottomRightResizer />
  </DraggableCore>
);
