import React, { FC, memo, useEffect, useRef, useState } from 'react';
import styled from '../theme';
import { Coordinate, Dimensions } from '../utils/types';

const StyledResizePreview = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 0px;
  height: 0px;
  transition: all 0.3s ease-out;
  background: ${p => p.theme.resizePreview.color};
  opacity: ${p => p.theme.resizePreview.opacity};
  border-radius: ${p => p.theme.desktopWindow.borderRadius};
`;

const getTranslate = (coordinate: Coordinate) => ({
  transform: `translateX(${coordinate.x}px) translateY(${coordinate.y}px)`
});

export interface ResizePreviewProps {
  dimensions: Dimensions;
  triggeredFrom: Coordinate;
  toCoordinate: Coordinate;
}

export const ResizePreview: FC<{
  showResizePreview?: ResizePreviewProps;
}> = memo(({ showResizePreview }) => {
  //When the preview changes from one preview to another, just transition
  //when it changes from undefined to a preview, animate in from triggeredFrom
  const [isFirstRender, setIsFirstRender] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsFirstRender(!showResizePreview), 0);
  }, [!showResizePreview]);

  //When the preview changes to undefined
  //animate to 0px by 0px and to the last triggeredFrom position
  const previousOrigin = useRef<Coordinate>({ x: 0, y: 0 });
  useEffect(() => {
    if (showResizePreview) {
      previousOrigin.current = showResizePreview.triggeredFrom;
    }
  }, [showResizePreview]);

  const positionStyle = showResizePreview
    ? isFirstRender
      ? {
          ...getTranslate(showResizePreview.triggeredFrom),
          transition: 'all 0s'
        }
      : {
          ...getTranslate(showResizePreview.toCoordinate),
          ...showResizePreview.dimensions
        }
    : getTranslate(previousOrigin.current);

  return <StyledResizePreview style={positionStyle} />;
});

ResizePreview.displayName = 'ResizePreview';
