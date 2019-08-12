import React, { FC } from 'react';
import { useDesktopActions, useDesktopState } from '../state/DesktopContext';
import { TASKBAR_POSITION_PLACEHOLDER } from '../state/desktopReducer';
import styled from '../theme';
import { useDimensions } from '../utils/useDimensions';
import { DesktopWindow } from './DesktopWindow';
import { ResizePreview } from './ResizePreview';
import { TaskbarIcon } from './TaskbarIcon';
import { ThemeSwitch } from './ThemeSwitch';

const StyledDesktop = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: ${p => p.theme.color.desktopBackground};
  position: relative;
  transition: background-color 0.3s ease-in-out;
`;

const StyledTaskbar = styled.div`
  height: ${({ theme }) =>
    theme.taskbarIcon.iconSideLength + theme.taskbarIcon.iconMargin * 2}px;

  background: ${p => p.theme.color.taskbarBackground};
  box-shadow: ${p => p.theme.elevation.low};
  transition: all 0.3s ease-in-out;
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
        <ThemeSwitch />
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
