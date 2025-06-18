import React from "react";
import Weather from "./Weather";
import useWeatherHandler from "./Weather.handler";
import {
  Screen,
  Weather as WeatherConfig,
} from "@client/schemas/schemaDesigner";

const WeatherWrapper = ({
  config,
  screenConfig,
}: {
  config: WeatherConfig;
  screenConfig: Screen;
}) => {
  const data = useWeatherHandler();

  if (!data) return null;
  return (
    <Weather
      config={config}
      data={data}
      screenDimension={{
        width: screenConfig.resolution.width,
        height: screenConfig.resolution.height,
      }}
    ></Weather>
  );
};

export default WeatherWrapper;
