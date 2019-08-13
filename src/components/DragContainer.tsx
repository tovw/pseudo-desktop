import React, { CSSProperties, FC } from 'react';
import { DraggableCore, DraggableCoreProps } from 'react-draggable';
import styled from '../theme';

export const StyledDragContainer = styled.span`
  position: absolute;
  left: 0;
  top: 0;
  transition: padding 0.2s ease-in-out;
`;

interface PositionStyleProps {
  positionStyles: CSSProperties;
}

export const DragContainer: FC<
  Partial<DraggableCoreProps> & PositionStyleProps
> = ({ positionStyles, children, ...props }) => (
  <DraggableCore {...props}>
    <StyledDragContainer style={positionStyles}>{children}</StyledDragContainer>
  </DraggableCore>
);
