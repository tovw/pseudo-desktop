import React from 'react';
import { render } from 'react-dom';
import { GlobalStyle, Primary, ThemeProvider } from './theme';
import { Desktop } from './components/Desktop';
import { DesktopStateProvider } from './state/desktopContext';

const App = () => (
  <>
    <GlobalStyle />
    <ThemeProvider theme={Primary}>
      <DesktopStateProvider>
        <Desktop />
      </DesktopStateProvider>
    </ThemeProvider>
  </>
);

render(<App />, document.getElementById('app-root'));
