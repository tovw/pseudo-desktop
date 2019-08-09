import { Theme } from '..';

export const Primary: Theme = {
  color: {
    desktopBackground: '#E6E6F2',
    taskbarBackground: '#93939B'
  },
  resizePreview: { opacity: 0.5, color: '#fff' },
  taskbarIcon: {
    iconSideLength: 60,
    iconMargin: 10,
    topHalfOpacity: 0.8,
    bottomHalfOpacity: 0.3,
    borderRadius: '15px'
  },
  desktopWindow: {
    bodyOpacity: 0.5,
    headerOpacity: 1,
    borderRadius: '20px',
    headerHeight: '2.5rem'
  },
  elevation: {
    high: '0px 0px 15px 5px rgba(0, 0, 0, 0.3)',
    low: '0px 0px 10px 0px rgba(0, 0, 0, 0.4)'
  }
};
