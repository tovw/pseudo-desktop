import { Theme } from '..';

export const Secondary: Theme = {
  color: {
    desktopBackground: '#DA13E8',
    taskbarBackground: '#B014FF'
  },
  resizePreview: { opacity: 0.5, color: '#000' },
  taskbarIcon: {
    iconSideLength: 80,
    iconMargin: 10,
    topHalfOpacity: 1,
    bottomHalfOpacity: 0.5,
    borderRadius: '0px'
  },
  desktopWindow: {
    bodyOpacity: 0.85,
    headerOpacity: 1,
    borderRadius: '0px',
    headerHeight: '3rem'
  },
  elevation: {
    high: '0px 0px 20px 5px rgba(0, 0, 0, 0.3)',
    low: '0px 0px 10px 2px rgba(0, 0, 0, 0.4)'
  }
};
