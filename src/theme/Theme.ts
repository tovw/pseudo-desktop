export default interface Theme {
  color: {
    desktopBackground: string;
    taskbarBackground: string;
  };
  resizePreview: {
    opacity: number;
    color: string;
  };
  taskbarIcon: {
    iconSideLength: number;
    iconMargin: number;
    borderRadius: string;
    topHalfOpacity: number;
    bottomHalfOpacity: number;
  };
  desktopWindow: {
    headerHeight: string;
    headerOpacity: number;
    bodyOpacity: number;
    borderRadius: string;
    siblingActiveFilter: string;
  };
  elevation: {
    high: string;
    low: string;
  };
}
