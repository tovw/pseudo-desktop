import React, { FC } from 'react';
import styled from '../theme';
import { DesktopWindow } from './DesktopWindow';

import {
  useDesktopState,
  useDesktopActions,
  TASKBAR_POSITION_PLACEHOLDER
} from '../state/desktopContext';
import { useDimensions } from '../utils/useDimensions';
import { ResizePreview } from './ResizePreview';
import { TaskbarIcon } from './TaskbarIcon';

const StyledDesktop = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: ${p => p.theme.color.desktopBackground};
  position: relative;
`;

const StyledTaskbar = styled.div`
  height: ${({ theme }) =>
    theme.taskbarIcon.iconSideLength + theme.taskbarIcon.iconMargin * 2}px;

  background: ${p => p.theme.color.taskbarBackground};
  box-shadow: ${p => p.theme.elevation.low};
`;

export const Desktop: FC = () => {
  const {
    taskBarIconOrder,
    desktopZindexes,
    uiWindows,
    activeWindowId,
    showResizePreview
  } = useDesktopState();
  const { setDesktopDimensions } = useDesktopActions();
  const { ref } = useDimensions(setDesktopDimensions);

  return (
    <StyledDesktop ref={ref}>
      <StyledTaskbar>
        {taskBarIconOrder.map(
          (id, order) =>
            id !== TASKBAR_POSITION_PLACEHOLDER && (
              <TaskbarIcon key={id} order={order} uiWindow={uiWindows[id]} />
            )
        )}
      </StyledTaskbar>
      {desktopZindexes.map(id => (
        <DesktopWindow
          key={id}
          uiWindow={uiWindows[id]}
          isSiblingActive={!!activeWindowId && activeWindowId !== id}
        />
      ))}
      <ResizePreview showResizePreview={showResizePreview} />
    </StyledDesktop>
  );
};
