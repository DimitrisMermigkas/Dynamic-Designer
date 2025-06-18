/**
 * detail can be of the format "Detail:SomeDetail", "Detail-2:Label" or "Detail-2:Value"
 */
function getDeviceDetail(detail: string) {
  const split = detail.split(":");
  const left = split[0];
  const right = split.slice(1).join(":");
  if (left === "Detail") {
    return window._DeviceDetails.find((item) => item.detail === right)
      ?.description;
  } else {
    const numberString = left.split("-")[1];
    if (!numberString) return undefined;
    const foundDetail = window._DeviceDetails.find(
      (item) => item.no === numberString
    );
    if (right === "Label") return foundDetail?.detail;
    else return foundDetail?.description;
  }
}

export function getDynamicDetail(detail: string) {
  // TODO DeviceName, BranchName and BranchDeviceDetail
  if (detail === "DeviceDescription") return window.getTitle();
  else if (detail === "DeviceCode")
    return window._AllDeviceDetails.find((item) => item.detail === "DeviceCode")
      ?.description;
  else if (detail === "BranchCode")
    return window._AllDeviceDetails.find((item) => item.detail === "StoreCode")
      ?.description;
  else if (detail === "Price") return window.getPrice();
  else if (detail === "ButlerPrice")
    return window._BranchDeviceDetails.find(
      (item) => item.detail === "ButlerPrice"
    )?.description;
  else if (detail === "StorePrice")
    return window._BranchDeviceDetails.find(
      (item) => item.detail === "StorePrice"
    )?.description;
  else if (detail.startsWith("Detail:") || detail.startsWith("Detail-")) {
    return getDeviceDetail(detail);
  }
}
