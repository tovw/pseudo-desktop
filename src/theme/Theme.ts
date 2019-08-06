export default interface Theme {
  color: {
    desktopBackground: string;
    taskbarBackground: string;
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
  };
  elevation: {
    high: string;
    low: string;
  };
}
