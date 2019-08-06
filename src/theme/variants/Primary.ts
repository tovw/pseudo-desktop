import { Theme } from '..';

export const Primary: Theme = {
  color: {
    desktopBackground: 'hotpink',
    taskbarBackground: 'salmon'
  },
  resizePreview: { opacity: 0.5 },
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
  },
  elevation: {
    high: '0px 0px 15px 5px rgba(0, 0, 0, 0.3)',
    low: '0px 0px 10px 0px rgba(0, 0, 0, 0.4)'
  }
};
