type DataBlock = {
  value: string;
  fontSize: string;
  fontColor: string;
  fontWeight: string;
  visibility: string;
};
type Cell = {
  fontSize: string;
  fontColor: string;
  fontWeight: string;
};
type DeviceDetail = {
  detail: string;
  description: string;
  no: string;
};
type BranchDeviceDetail = {
  detail: string;
  description: string;
};

declare interface Window {
  /** Device description */
  _Title: DataBlock;
  _Subtitle: DataBlock;
  _Price: DataBlock;
  _Cell1: Cell;
  _Cell2: Cell;
  _Logo: {
    src: string;
    alingment: string;
    visibility: string;
  };
  _BackgroundSvg: { src: string; visibility: string };
  _BackgroundColor: string;
  _FontName: string;
  _Height: string;
  _Width: string;
  _DefaultWidth: string;
  _DefaultHeight: string;
  _HasSelectedDetails: "False" | "True";
  _BranchID: string;
  _DeviceDetails: DeviceDetail[];
  /** Has items with detail "StorePrice", "ButlerPrice" and other BranchDeviceDetail columns */
  _BranchDeviceDetails: BranchDeviceDetail[];
  /** Contains _DeviceDetails, plus items with detail "StoreCode", "DeviceCode" and possibly "RelatedProductsJson" */
  _AllDeviceDetails: DeviceDetail[];
  QrAdvisorToken?: string;

  newFontSize(size: string, max: number): string;

  getTitle(): string;

  getSubtitle(): string;

  getPrice(): string;

  getNumOfDetails(): number;

  getWidth(): string;

  getHeight(): string;

  getLogoAlingment(): string;

  getSvgVisibility(): string;
}
