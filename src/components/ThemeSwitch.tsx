import React, { FC, useState } from 'react';
import styled from '../theme';
import { useSetTheme } from '../state/ThemeContext';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledSwitch = styled(({ on, ...props }) => (
  <div {...props}>
    <div></div>
  </div>
))<{ on: boolean }>`
  position: absolute;
  right: 1rem;
  top: 1rem;
  height: 2rem;
  width: 4rem;
  border-radius: 1rem;
  background: ${p => p.theme.color.desktopBackground};
  cursor: pointer;

  > div {
    height: 1.6rem;
    width: 1.6rem;
    border-radius: 50%;
    background: ${p => p.theme.color.taskbarBackground};
    transform: translateX(${p => (p.on ? '0.2rem' : '2.2rem')})
      translateY(0.2rem);
    transition: all 0.3s ease-in-out;
  }
`;

export const ThemeSwitch: FC = () => {
  const [on, setValue] = useState(true);
  const updateTheme = useSetTheme();

  const onClick = () => {
    updateTheme(Number(!!on));
    setValue(v => !v);
  };

  return <StyledSwitch onClick={onClick} on={on}></StyledSwitch>;
};
