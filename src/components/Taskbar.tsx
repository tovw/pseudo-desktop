import React, { FC } from 'react';
import styled from '../theme';
import { TaskbarIcon } from './TaskbarIcon';
import {
  useDesktopState,
  TASKBAR_POSITION_PLACEHOLDER
} from '../state/desktopContext';

const StyledTaskbar = styled.div`
  height: ${({ theme }) =>
    theme.taskbarIcon.iconSideLength + theme.taskbarIcon.iconMargin * 2}px;
  width: 100vw;
  background: ${p => p.theme.color.taskbarBackground};
  box-shadow: ${p => p.theme.elevation.low};
`;

export const Taskbar: FC = () => {
  const { taskBarIconOrder, uiWindows } = useDesktopState();

  return (
    <StyledTaskbar>
      {taskBarIconOrder.map(
        (id, order) =>
          id !== TASKBAR_POSITION_PLACEHOLDER && (
            <TaskbarIcon key={id} order={order} uiWindow={uiWindows[id]} />
          )
      )}
    </StyledTaskbar>
  );
};
