import React, { FC, useState } from 'react';
import styled from '../theme';
import { TaskbarIcon } from './TaskbarIcon';

const StyledTaskbar = styled.div`
  height: ${p =>
    p.theme.taskbarIcon.iconSideLength + p.theme.taskbarIcon.iconMargin * 2}px;
  width: 100vw;
  background: ${p => p.theme.color.taskbarBackground};
`;

export const Taskbar: FC = () => {
  const [icons, setIcons] = useState([
    { id: '2', top: 111, left: 231, width: 123, height: 234, color: 'blue' },
    { id: '3', top: 111, left: 231, width: 123, height: 234, color: 'green' }
  ]);

  return (
    <StyledTaskbar>
      {icons.map((i, o) => (
        <TaskbarIcon
          key={i.id}
          order={o}
          uiWindow={i}
          updatePosition={() => void 1}
        />
      ))}
    </StyledTaskbar>
  );
};
