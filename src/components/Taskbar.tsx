import React, { FC } from 'react';
import styled from '../theme';

const StyledTaskbar = styled.div`
  height: ${p =>
    p.theme.taskbarIcon.iconSideLength + p.theme.taskbarIcon.iconMargin * 2}px;
  width: 100vw;
  background: ${p => p.theme.color.taskbarBackground};
`;

export const Taskbar: FC = () => {
  return <StyledTaskbar></StyledTaskbar>;
};
