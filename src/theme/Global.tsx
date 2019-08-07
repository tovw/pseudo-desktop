import { createGlobalStyle } from './config';

const GlobalStyle = createGlobalStyle`
	* {
		outline: none;
		box-sizing: border-box;
		padding: 0;
		margin: 0;
	}
	html {
		font-size: 62.5%;
	}
	a {
		text-decoration: none;
	}
`;

export default GlobalStyle;
