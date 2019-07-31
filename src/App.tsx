import React from 'react';
import { render } from 'react-dom';
import styled, { GlobalStyle, Primary, ThemeProvider } from './theme';

const StyledHW = styled.h1`
  color: ${p => p.theme.color};
`;

const App = () => (
  <>
    <GlobalStyle />
    <ThemeProvider theme={Primary}>
      <StyledHW>hw</StyledHW>
    </ThemeProvider>
  </>
);

render(<App />, document.getElementById('app-root'));
