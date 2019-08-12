import React from 'react';
import { render } from 'react-dom';
import { GlobalStyle } from './theme';
import { Desktop } from './components/Desktop';
import { DesktopStateProvider } from './state/DesktopContext';
import { ThemeContext } from './state/ThemeContext';

const App = () => (
  <>
    <GlobalStyle />
    <ThemeContext>
      <DesktopStateProvider>
        <Desktop />
      </DesktopStateProvider>
    </ThemeContext>
  </>
);

render(<App />, document.getElementById('app-root'));
