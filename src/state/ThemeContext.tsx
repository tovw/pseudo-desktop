import React, { FC, useState, useContext } from 'react';
import { Theme, Primary, Secondary, ThemeProvider } from '../theme';

const Themes: Theme[] = [Primary, Secondary];

const SetThemeContext = React.createContext<(index: number) => void>(() => {});

export const ThemeContext: FC = ({ children }) => {
  const [activeThemeIndex, setActiveThemeIndex] = useState(0);
  return (
    <ThemeProvider theme={Themes[activeThemeIndex]}>
      <SetThemeContext.Provider value={setActiveThemeIndex}>
        {children}
      </SetThemeContext.Provider>
    </ThemeProvider>
  );
};

export const useSetTheme = () => {
  const context = useContext(SetThemeContext);
  if (context) return context;
  throw new Error('UseSetTheme outside of provider!');
};
