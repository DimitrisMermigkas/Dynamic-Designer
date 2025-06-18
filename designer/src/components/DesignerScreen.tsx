import React from "react";
import { Screen } from "@hella_project/common/validation/schemaDesigner";
import DesignerObject from "./DesignerObject";
import useWindowSize from "../hooks/useWindowSize";

type DesignerScreenProps = {
  screenConfig: Screen;
  setCurrentScreenId: (id: string) => void;
  onClick?: React.MouseEventHandler;
};

const DesignerScreen = ({
  screenConfig,
  setCurrentScreenId,
  onClick,
}: DesignerScreenProps) => {
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const areaWidth = windowWidth;
  const areaHeight = windowHeight;
  const scale = Math.min(
    areaWidth / screenConfig.resolution.width,
    areaHeight / screenConfig.resolution.height
  );
  let marginLeft = Math.max(
    0,
    ((areaWidth / screenConfig.resolution.width -
      areaHeight / screenConfig.resolution.height) *
      screenConfig.resolution.width) /
      2
  );
  let marginTop = Math.max(
    0,
    ((areaHeight / screenConfig.resolution.height -
      areaWidth / screenConfig.resolution.width) *
      screenConfig.resolution.height) /
      2
  );

  const outerStyle: React.CSSProperties = {
    backgroundColor: screenConfig.background,
    width: "100vw",
    height: "100vh",
    position: "absolute",
  };

  const innerStyle: React.CSSProperties = {
    width: screenConfig.resolution.width,
    height: screenConfig.resolution.height,
    transform: `scale(${scale})`,
    transformOrigin: "left top",
    marginLeft,
    marginTop,
  };

  return (
    <div style={outerStyle}>
      <div onClick={onClick} style={innerStyle}>
        {screenConfig.objects.map((objectConfig) => (
          <DesignerObject
            key={objectConfig.id}
            objectJson={objectConfig}
            setCurrentScreenId={setCurrentScreenId}
            screenConfig={screenConfig}
          />
        ))}
      </div>
    </div>
  );
};

export default DesignerScreen;
