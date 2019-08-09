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
    high: '6px 6px 6px 8px rgba(0, 0, 0, 0.3)',
    low: '3px 3px 3px 3px rgba(0, 0, 0, 0.50)'
  }
};
