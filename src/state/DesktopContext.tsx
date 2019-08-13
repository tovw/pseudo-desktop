import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from 'react';
import { ThemeContext } from 'styled-components';
import { Theme } from '../theme';
import {
  actionCreators,
  ActionTypes,
  DesktopActionCreators
} from './desktopActions';
import { desktopReducer, DesktopState, initialState } from './desktopReducer';

const DesktopStateContext = createContext<DesktopState>(initialState);
const DesktopDispatchContext = createContext<DesktopActionCreators | null>(
  null
);

export const DesktopStateProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(desktopReducer, initialState);
  const actions = useMemo<DesktopActionCreators>(
    () => actionCreators(dispatch),
    [dispatch]
  );

  //Sync icon dimensions from theme when theme changes
  const {
    taskbarIcon: { iconSideLength, iconMargin }
  } = useContext<Theme>(ThemeContext);
  useEffect(
    () =>
      dispatch({
        type: ActionTypes.SET_ICON_THEME_VARIABLES,
        payload: {
          taskbarIconMargin: iconMargin,
          taskbarIconSideLength: iconSideLength
        }
      }),
    [iconSideLength, iconMargin]
  );

  return (
    <DesktopStateContext.Provider value={state}>
      <DesktopDispatchContext.Provider value={actions}>
        {children}
      </DesktopDispatchContext.Provider>
    </DesktopStateContext.Provider>
  );
};

export const useDesktopState = () => {
  const context = useContext(DesktopStateContext);
  if (context) return context;
  throw new Error('UseStateContext outside of provider!');
};

export const useDesktopActions = () => {
  const context = useContext(DesktopDispatchContext);
  if (context) return context;
  throw new Error('UseStateContext outside of provider!');
};
