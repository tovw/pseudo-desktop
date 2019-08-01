import React, { FC } from 'react';
import styled from '../theme';
import { DesktopWindow } from './DesktopWindow';
import { Taskbar } from './Taskbar';
import { useDesktopState, useDesktopActions } from '../state/desktopContext';

const StyledDesktop = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: ${p => p.theme.color.desktopBackground};
`;

export const Desktop: FC = () => {
  const { uiWindows, desktopZindexes } = useDesktopState();
  const actions = useDesktopActions();

  return (
    <StyledDesktop>
      <Taskbar />
      {desktopZindexes.map((id, idx) => (
        <DesktopWindow
          key={id}
          uiWindow={uiWindows[id]}
          zIndex={idx}
          {...actions}
        />
      ))}
    </StyledDesktop>
  );
};
