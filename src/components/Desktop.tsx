import React, { FC, useState, useCallback } from 'react';
import styled from '../theme';
import { UIWindow, DesktopWindow } from './DesktopWindow';
import { Taskbar } from './Taskbar';

const StyledDesktop = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: ${p => p.theme.color.desktopBackground};
`;

export const Desktop: FC = () => {
  const [apps, setApps] = useState<UIWindow[]>([
    {
      id: '1',
      left: 100,
      top: 100,
      width: 300,
      height: 300,
      color: 'papayawhip'
    }
  ]);

  const updatePosition = useCallback(
    (id: string, left: number, top: number) => {
      setApps([
        ...apps.filter(w => w.id !== id),
        { ...apps.find(w => w.id === id)!, left, top }
      ]);
    },
    [setApps]
  );

  return (
    <StyledDesktop>
      <Taskbar></Taskbar>
      {apps.map(w => (
        <DesktopWindow
          key={w.id}
          uiWindow={w}
          updatePosition={updatePosition}
        />
      ))}
    </StyledDesktop>
  );
};
