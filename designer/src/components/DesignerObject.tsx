import React from "react";
import {
  Screen,
  ScreenObject,
} from "@hella_project/common/validation/schemaDesigner";
import Rectangle from "./basic/Rectangle";
import Text from "./basic/Text";
import Button from "./widgets/Button";
import QRCode from "./widgets/QRCode";
import WeatherWrapper from "./widgets/WeatherWrapper";
import ObjectErrorBoundary from "./ObjectErrorBoundary";
import RSSFeedWrapper from "./widgets/RSSFeedWrapper";
import Ellipse from "./basic/Ellipse";
import Triangle from "./basic/Triangle";
import Embed from "./widgets/Embed";
import Multimedia from "./basic/Multimedia";
import Line from "./basic/Line";

type DesignerObjectProps<Type> = {
  objectJson: Extract<ScreenObject, { type: Type }>;
  setCurrentScreenId: (id: string) => void;
  screenConfig: Screen;
};

type ComponentType<Type> = (props: {
  config: Extract<ScreenObject, { type: Type }>;
  handleTrigger?: (trigger: "onClick") => void;
  screenConfig?: Screen;
}) => JSX.Element;

const objectTypes = {
  Ellipse: Ellipse,
  Rect: Rectangle,
  Triangle: Triangle,
  IText: Text,
  Button: Button,
  QRCode: QRCode,
  Weather: WeatherWrapper,
  RSSFeed: RSSFeedWrapper,
  Embed: Embed,
  Line: Line,
  Multimedia: Multimedia,
} as {
  [Type in ScreenObject["type"]]: ComponentType<Type> | null;
};

const DesignerObject = <Type extends ScreenObject["type"]>({
  objectJson,
  setCurrentScreenId,
  screenConfig,
}: DesignerObjectProps<Type>) => {
  const Component = objectTypes[objectJson.type] as ComponentType<Type> | null;

  if (!Component) return null;

  const handleTrigger = (trigger: "onClick") => {
    if ("triggers" in objectJson) {
      const filteredTriggers = (objectJson.triggers ?? []).filter(
        (tr) => tr.type === trigger
      );
      filteredTriggers.forEach((tr) => {
        (tr?.actions ?? [])?.forEach((action) => {
          if (action.type === "goToScreen" && action.referenceId) {
            setCurrentScreenId(action.referenceId);
          } else if (action.type === "tryMe") {
            window.pmJsLib.tryMeBtn?.();
          }
        });
      });
    }
  };

  return (
    <ObjectErrorBoundary>
      <Component
        config={objectJson}
        handleTrigger={handleTrigger}
        screenConfig={screenConfig}
      />
    </ObjectErrorBoundary>
  );
};

export default DesignerObject;
