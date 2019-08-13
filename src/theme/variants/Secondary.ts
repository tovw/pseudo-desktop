import { Theme } from '..';

export const Secondary: Theme = {
  color: {
    desktopBackground: '#404552',
    taskbarBackground: '#383c4a'
  },
  resizePreview: { opacity: 0.5, color: '#000' },
  taskbarIcon: {
    iconSideLength: 60,
    iconMargin: 10,
    topHalfOpacity: 1,
    bottomHalfOpacity: 0.5,
    borderRadius: '0px'
  },
  desktopWindow: {
    bodyOpacity: 0.8,
    headerOpacity: 1,
    borderRadius: '0px',
    headerHeight: '3.5rem',
    siblingActiveFilter: 'blur(2px) grayscale(0.2)'
  },
  elevation: {
    high: '4px 4px 4px 6px rgba(33, 33, 33, 0.3)',
    low: '2px 2px 2px 2px rgba(33, 33, 33, 0.50)'
  }
};
