import React, { FC } from 'react';
import styled from '../theme';
import { TaskbarIcon } from './TaskbarIcon';
import {
  useDesktopState,
  useDesktopActions,
  TASKBAR_POSITION_PLACEHOLDER
} from '../state/desktopContext';

const StyledTaskbar = styled.div`
  height: ${p =>
    p.theme.taskbarIcon.iconSideLength + p.theme.taskbarIcon.iconMargin * 2}px;
  width: 100vw;
  background: ${p => p.theme.color.taskbarBackground};
`;

export const Taskbar: FC = () => {
  const { taskBarIconOrder, uiWindows } = useDesktopState();
  const actions = useDesktopActions();

  return (
    <StyledTaskbar>
      {taskBarIconOrder.map(
        (id, o) =>
          id !== TASKBAR_POSITION_PLACEHOLDER && (
            <TaskbarIcon
              key={id}
              order={o}
              uiWindow={uiWindows[id]}
              {...actions}
            />
          )
      )}
    </StyledTaskbar>
  );
};
