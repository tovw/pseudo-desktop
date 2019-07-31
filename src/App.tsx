import React from 'react';
import { render } from 'react-dom';
import { GlobalStyle, Primary, ThemeProvider } from './theme';
import { Desktop } from './components/Desktop';

const App = () => (
  <>
    <GlobalStyle />
    <ThemeProvider theme={Primary}>
      <Desktop />
    </ThemeProvider>
  </>
);

render(<App />, document.getElementById('app-root'));
