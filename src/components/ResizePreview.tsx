import React, {
  CSSProperties,
  FC,
  memo,
  useEffect,
  useRef,
  useState
} from 'react';
import styled from '../theme';
import { Coordinate, Dimensions, Maybe } from '../utils/types';

const StyledResizePreview = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 0px;
  height: 0px;
  transition: all 0.3s ease-out;
  background: #fff;
  opacity: ${p => p.theme.resizePreview.opacity};
  border-radius: ${p => p.theme.desktopWindow.borderRadius};
`;

const getResizePreviewPositionStyles = (
  other: CSSProperties,
  coordinate: Coordinate
) => ({
  ...other,
  transform: `translateX(${coordinate.x}px) translateY(${coordinate.y}px)`
});

export const ResizePreview: FC<{
  showResizePreview: Maybe<{
    dimensions: Dimensions;
    triggeredFrom: Coordinate;
    toCoordinate: Coordinate;
  }>;
}> = memo(({ showResizePreview }) => {
  const [isFirstRender, setIsFirstRender] = useState(false);
  const previousOrigin = useRef<Coordinate>({ x: 0, y: 0 });
  useEffect(() => {
    if (showResizePreview) {
      previousOrigin.current = showResizePreview.triggeredFrom;
    }
  }, [showResizePreview]);

  const positionStyle = showResizePreview
    ? isFirstRender
      ? getResizePreviewPositionStyles(
          { transition: 'all 0s' },
          showResizePreview.triggeredFrom
        )
      : getResizePreviewPositionStyles(
          showResizePreview.dimensions,
          showResizePreview.toCoordinate
        )
    : getResizePreviewPositionStyles({}, previousOrigin.current);

  const hasResizePreview = !!showResizePreview;
  useEffect(() => {
    setTimeout(() => setIsFirstRender(!hasResizePreview), 0);
  }, [hasResizePreview]);

  return <StyledResizePreview style={positionStyle} />;
});

ResizePreview.displayName = 'ResizePreview';
