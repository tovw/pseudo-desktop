import { Theme } from '..';

export const Secondary: Theme = {
  color: {
    desktopBackground: '#452691',
    taskbarBackground: '#26154f'
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
    bodyDragOpacity: 0.9,
    headerOpacity: 1,
    borderRadius: '0px',
    headerHeight: '3.5rem'
  },
  elevation: {
    high: '4px 4px 4px 6px rgba(33, 33, 33, 0.3)',
    low: '2px 2px 2px 2px rgba(33, 33, 33, 0.50)'
  }
};
