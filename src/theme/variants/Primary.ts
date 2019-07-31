import { Theme } from '..';

export const Primary: Theme = {
  color: {
    desktopBackground: 'hotpink',
    taskbarBackground: 'salmon'
  },
  taskbarIcon: {
    iconSideLength: 80,
    iconMargin: 10,
    topHalfOpacity: 1,
    bottomHalfOpacity: 0.7,
    borderRadius: '5px'
  },
  desktopWindow: {
    bodyOpacity: 0.7,
    headerOpacity: 1,
    borderRadius: '10px',
    headerHeight: '2rem'
  }
};
