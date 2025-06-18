import React, { useRef, useState } from "react";
import { Screen } from "@hella_project/common/validation/schemaDesigner";
import DesignerScreen from "./DesignerScreen";

type ScreensProps = {
  screens: Screen[];
};

const Screens = ({ screens }: ScreensProps) => {
  // Get default, or first if accidentally none were set as default
  const defaultScreen = screens.find((screen) => screen.default) || screens[0];

  const [currentScreenId, setCurrentScreenId] = useState(defaultScreen.id);
  const currentScreen = screens.find(
    (screen) => screen.id === currentScreenId
  ) as Screen;

  // Handle idle return time
  const returnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const setReturnTimeout = (onIdleReturn: Screen["onIdleReturn"]) => {
    if (returnTimeoutRef.current) {
      clearTimeout(returnTimeoutRef.current);
      returnTimeoutRef.current = null;
    }
    if (onIdleReturn?.id && onIdleReturn?.time) {
      returnTimeoutRef.current = setTimeout(() => {
        goToScreen(defaultScreen.id);
      }, Number(onIdleReturn.time) * 1000);
    }
  };
  const goToScreen = (screenId: string) => {
    const newScreen = screens.find((screen) => screen.id === screenId);
    if (newScreen) {
      setCurrentScreenId(screenId);
      setReturnTimeout(newScreen.onIdleReturn);
    }
  };
  const onScreenClick = (e: React.MouseEvent) => {
    setReturnTimeout(currentScreen.onIdleReturn);
  };

  return (
    <DesignerScreen
      screenConfig={currentScreen}
      setCurrentScreenId={goToScreen}
      onClick={onScreenClick}
    />
  );
};

export default Screens;
