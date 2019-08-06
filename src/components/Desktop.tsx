import React, { FC } from 'react';
import styled from '../theme';
import { DesktopWindow } from './DesktopWindow';
import { Taskbar } from './Taskbar';
import { useDesktopState, useDesktopActions } from '../state/desktopContext';
import { useDimensions } from '../utils/useDimensions';
import { ResizePreview } from './ResizePreview';

const StyledDesktop = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: ${p => p.theme.color.desktopBackground};
`;

export const Desktop: FC = () => {
  const { uiWindows, desktopZindexes, showResizePreview } = useDesktopState();
  const { setDesktopDimensions } = useDesktopActions();
  const { ref } = useDimensions(setDesktopDimensions);

  return (
    <StyledDesktop ref={ref}>
      <Taskbar />
      {desktopZindexes.map(id => (
        <DesktopWindow key={id} uiWindow={uiWindows[id]} />
      ))}
      <ResizePreview showResizePreview={showResizePreview} />
    </StyledDesktop>
  );
};
