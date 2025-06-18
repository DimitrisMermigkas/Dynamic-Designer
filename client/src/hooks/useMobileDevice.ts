import { isMobile } from "react-device-detect";

const useMobileDevice = () => {
  const mobileBrowser = isMobile;
  const deviceWidth = window.innerWidth;

  // Use hook to trigger rerender when orientation changes

  if (mobileBrowser) {
    if (deviceWidth < 480) return "mobile"; //mobilePortrait
    else return "tablet"; //mobile landscape or tablet
  } else return "desktop";
};

export default useMobileDevice;
