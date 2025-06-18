import React from "react";
import {
  RSSFeed,
  Weather,
  Embed,
  QRCode,
  QRCodeSettings,
  Button,
} from "@jms/designer";
import EmbedTemp from "../CustomElements/EmbedTemp";
import {
  Embed as EmbedConfig,
  ButtonObject,
  QRCode as QRCodeConfig,
  RSSFeed as RSSFeadConfig,
  Weather as WeatherConfig,
} from "../../../../schemas/schemaDesigner";

const CustomItemsPicker = ({
  canvasDimension,
  screenDimension,
  type,
  ...props
}) => {
  let element = null;
  const elementSize = {
    width: Math.round(
      (props.size.width * screenDimension.width) / canvasDimension.width
    ),
    height: Math.round(
      (props.size.height * screenDimension.height) / canvasDimension.height
    ),
  };
  // const elementSize = props.size;
  switch (type) {
    case "Weather":
      element = (
        <Weather
          config={{ settings: props, ...elementSize } as WeatherConfig}
          data={props.data}
          screenDimension={screenDimension}
        />
      );
      return element;
    case "RSSFeed":
      element = (
        <RSSFeed
          config={
            { ...props, ...elementSize, settings: props } as RSSFeadConfig
          }
          data={props.data}
        />
      );
      return element;
    case "QRCode":
      element = (
        <QRCode
          config={
            {
              ...props,
              ...elementSize,
              settings: { ...QRCodeSettings, ...props, typeText: "static" },
            } as unknown as QRCodeConfig
          }
        />
      );
      return element;
    case "Button":
      element = (
        <Button
          config={{ ...props, ...elementSize, settings: props } as ButtonObject}
          handleTrigger={() => null}
        />
      );
      return element;
    case "Embed":
      if (props && props.preview) {
        element = (
          <Embed
            config={
              { ...props, settings: props, ...elementSize } as EmbedConfig
            }
          />
        );
      } else {
        element = <EmbedTemp config={{ ...elementSize }} />;
      }
      return element;
    default:
      break;
  }
};

export default CustomItemsPicker;
