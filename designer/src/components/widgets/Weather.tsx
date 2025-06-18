import React from "react";
import day from "../../assets/images/weather/day.svg";
import partlyCloudy from "../../assets/images/weather/cloudy-day-1.svg";
import cloudy from "../../assets/images/weather/cloudy.svg";
import rainy from "../../assets/images/weather/rainy-5.svg";
import snowy from "../../assets/images/weather/snowy-6.svg";
import { css } from "@emotion/css";
import { Weather as WeatherConfig } from "@client/schemas/schemaDesigner";
import { baseConfigToStyle } from "../../utils/styleUtils";

type Mode = "vertical" | "horizontal" | "minimized";
export type WeatherCondition =
  | "Sunny"
  | "PartlyCloudy"
  | "Cloudy"
  | "Rainy"
  | "Snowy";

type WeatherData = {
  index: number;
  tempHigh: string;
  tempLow: string;
  condition: WeatherCondition;
  temperature?: string;
};

export type WeatherWidgetData = {
  days: WeatherData[];
  locationName: string;
};

type WeatherProps = {
  config: WeatherConfig;
  screenDimension: { width: number; height: number };
  data: WeatherWidgetData;
};

const generateClasses = ({
  left,
  top,
  currentHeight,
  currentWidth,
  backgroundColor,
  borderColor,
  borderWidth,
  borderRadius,
  mode,
  fontSize,
  screenDimension,
}: {
  left: number;
  top: number;
  currentHeight: any;
  currentWidth: any;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  mode?: Mode;
  fontSize?: string;
  screenDimension: { width: number; height: number };
}) => ({
  containerMinimized: css`
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    height: ${currentHeight === "100%" ? "100%" : currentHeight + "px"};
    margin: 0 auto;
    width: ${currentWidth + "px"};
    background: ${backgroundColor};
    border: ${borderWidth}px solid ${borderColor};
    box-sizing: border-box;
    border-radius: ${borderRadius}px;
  `,
  container: css`
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    display: flex;
    flex-direction: ${mode === "vertical" ? "column" : "row"};
    align-items: center;
    height: ${currentHeight === "100%" ? "100%" : currentHeight + "px"};
    width: ${currentWidth + "px"};
    background: ${backgroundColor};
    border: ${borderWidth}px solid ${borderColor};
    box-sizing: border-box;
    border-radius: ${borderRadius}px;
    h2,
    h3,
    h4,
    h5,
    h6,
    p {
      display: flex;
      justify-content: center;
      font-size: ${Math.max(
        20, // Minimum font size
        Math.min(currentHeight / 22, currentWidth / 28) // Average-based scaling
      )}px;
    }
  `,
  currentWeather: css`
    align-items: center;
    width: 95%;
    flex-direction: ${currentWidth / screenDimension.width < 0.145
      ? "column"
      : "row"};
    // margin-bottom: 1.5%;
    border-bottom: ${mode === "vertical" ? "solid 1px" : undefined};
    // display: grid;
    // grid-template-columns: ${mode === "vertical" ? "65% 35%" : " 100%"};
    height: fit-content;
  `,
  horizontalTitleRow: css`
    display: grid;
    grid-template-columns: 65% 35%;
    align-items: center;
  `,
  temperature: css`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  titleTemperature: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: center;
    row-gap: 15%;
  `,
  upcomingWeather: css`
    display: flex;
    flex-direction: ${currentWidth / screenDimension.width < 0.15
      ? "column"
      : "row"};
    justify-content: space-evenly;
    align-items: center;
    width: 100%;
  `,
  daysContainer: css`
    display: flex;
    justify-content: center;
    height: ${currentHeight === "100%" ? "100%" : currentHeight + "px"};
    width: 100%;
  `,
  currentTemperature: css`
    font-size: ${fontSize};
  `,
  iconTemperature: css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
  `,
  iconTemperatureVertical: css`
    justify-content: center;
    align-items: center;
    display: flex;
    height: 100%;
  `,
  currentWeatherTitle: css`
    font-size: 24px;
    margin-block: 0.83em;
  `,
  weekday: css`
    margin: 0;
  `,
  weatherIcon: css`
    width: ${Math.max(
      30,
      Math.min(currentWidth, currentHeight) / 8
    )}px; // Ensure a minimum size
    height: ${Math.max(
      30,
      Math.min(currentWidth, currentHeight) / 8
    )}px; // Ensure a minimum size
    margin: ${Math.max(5, currentWidth / 264)}px; // Dynamic margin
  `,
  day: css`
    width: 12%;
    height: 40%;
    text-align: center;
  `,
  dayVertical: css`
    width: 100%;
    justify-content: space-evenly;
    align-items: center;
    display: flex;
  `,
  img: css`
    height: 100%;
  `,
  iconWithText: css`
    display: flex;
    align-items: center;
  `,
  temperatureText: css`
    margin: 0;
    font-size: 16px;
  `,
  horizontalWeatherTitle: css`
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: center;
  `,
  tempWithIconAndText: css`
    display: flex;
    align-items: center;
  `,
  weekdays: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: flex-start;
    row-gap: 15%;
  `,
});

const calculateTitleFontSize = (width: number, height: number): string => {
  const baseFontSize = Math.max(
    25, // Minimum font size
    Math.min(height / 12, width / 26) // Average-based scaling
  ); // Example scaling factor
  return `${baseFontSize}px`;
};

function weatherStyleConfig(config: WeatherConfig) {
  const style: React.CSSProperties = {
    ...baseConfigToStyle(config),
    backgroundColor: config.settings?.backgroundColor || "transparent",
    borderColor: config.settings?.borderColor,
    borderWidth: config.settings?.borderWidth,
    borderRadius: config.settings?.borderRadius,
  };

  return style;
}

type WeatherTitleProps = {
  classes?: any;
  currentDate?: string;
  getWeatherIcon: (value: WeatherCondition) => string | undefined;
  getWeekday?: any;
  locationName: string;
  dataToday: WeatherData;
};

const MinimizedWeatherTitle = ({
  classes,
  getWeekday,
  getWeatherIcon,
  locationName,
  dataToday,
}: WeatherTitleProps) => {
  return (
    <div className={classes.containerMinimized}>
      <div
        style={{
          marginLeft: "10px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
        }}
      >
        <p style={{ margin: 0 }}>{dataToday.temperature}</p>
        <h5>{locationName}</h5>
      </div>
      <div style={{ height: "100%" }}>
        <img
          src={getWeatherIcon(dataToday.condition)}
          alt={dataToday.condition}
        />
      </div>
    </div>
  );
};

const VerticalWeatherTitle = ({
  classes,
  currentDate,
  getWeatherIcon,
  locationName,
  dataToday,
}: WeatherTitleProps) => {
  return (
    <div className={classes.currentWeather}>
      <div className={classes.horizontalTitleRow}>
        <h2
          className={classes.currentWeatherTitle}
          style={{ justifyContent: "unset" }}
        >
          {locationName}
        </h2>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <h1 className={classes.currentTemperature} style={{ margin: 0 }}>
            {dataToday.temperature}
          </h1>
        </div>
      </div>
      <div className={classes.horizontalTitleRow}>
        <div
          style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
        >
          <h4 className={classes.weekday}>{currentDate}</h4>
          <div className={classes.iconWithText}>
            <img
              className={classes.weatherIcon}
              src={getWeatherIcon(dataToday.condition)}
              alt={dataToday.condition}
            />
            <h4>{dataToday.condition}</h4>
          </div>
        </div>
        <div className={classes.titleTemperature}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              height: "100%",
            }}
          >
            <p className={classes.temperatureText}>{dataToday.tempHigh}</p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              height: "100%",
            }}
          >
            <p className={classes.temperatureText}>{dataToday.tempLow}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HorizontalWeatherTitle = ({
  classes,
  currentDate,
  getWeatherIcon,
  locationName,
  dataToday,
}: WeatherTitleProps) => {
  return (
    <div
      className={classes.currentWeather}
      style={{ marginLeft: "8px", width: "50%" }}
    >
      <div className={classes.horizontalWeatherTitle}>
        <div className={classes.horizontalTitleRow}>
          <h2
            className={classes.currentWeatherTitle}
            style={{ justifyContent: "unset" }}
          >
            {locationName}
          </h2>
          <h1 className={classes.currentTemperature}>
            {dataToday.temperature}
          </h1>
        </div>
        <div className={classes.horizontalTitleRow}>
          <h4 className={classes.weekday}>{currentDate}</h4>
          <div className={classes.tempWithIconAndText}>
            <div className={classes.iconWithText}>
              <img
                className={classes.weatherIcon}
                src={getWeatherIcon(dataToday.condition)}
                alt={dataToday.condition}
              />
              <h4>{dataToday.condition}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type DaysProps = {
  classes: ReturnType<typeof generateClasses>;
  currentWidth?: any;
  currentHeight?: any;
  mode?: any;
  daysArray: WeatherData[];
  screenDimension: { width: number; height: number };
  getWeekday: (index: number) => string;
  getWeatherIcon: (condition: WeatherCondition) => string | undefined;
};

const Days = ({
  classes,
  currentWidth,
  currentHeight,
  mode,
  daysArray,
  getWeekday,
  getWeatherIcon,
  screenDimension,
}: DaysProps) => {
  return (
    <div className={classes.daysContainer}>
      {daysArray.length > 1 ? (
        <div className={classes.upcomingWeather}>
          {daysArray.map((value) => {
            return (
              <div
                key={value.index}
                className={
                  currentWidth / screenDimension.width < 0.145
                    ? classes.dayVertical
                    : classes.day
                }
              >
                <h3 className={classes.weekday}>{getWeekday(value.index)}</h3>
                <div
                  className={
                    currentWidth / screenDimension.width < 0.145
                      ? classes.iconTemperatureVertical
                      : classes.iconTemperature
                  }
                >
                  <img
                    className={classes.weatherIcon}
                    src={getWeatherIcon(value.condition)}
                    alt={value.condition}
                  />
                  <div className={classes.weekdays}>
                    <p className={classes.temperatureText}>{value.tempHigh}</p>
                    <p className={classes.temperatureText}>{value.tempLow}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={classes.upcomingWeather}>
          <div
            className={mode === "vertical" ? classes.dayVertical : classes.day}
          >
            <h3 className={classes.weekday}>Tommorow</h3>
            <div
              className={
                mode === "vertical"
                  ? classes.iconTemperatureVertical
                  : classes.iconTemperature
              }
            >
              <img
                className={classes.weatherIcon}
                src={getWeatherIcon(daysArray[0].condition)}
                alt={daysArray[0].condition}
              />
              <div>
                <p className={classes.temperatureText}>
                  {daysArray[0].tempHigh}
                </p>
                <p className={classes.temperatureText}>
                  {daysArray[0].tempLow}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Weather = ({ config, screenDimension, data }: WeatherProps) => {
  const left = config.left ?? 0;
  const top = config.top ?? 0;
  const style = weatherStyleConfig(config);
  const currentWidth = config.width ?? 500;
  const currentHeight = config.height ?? "100%";
  const backgroundColor = style?.backgroundColor ?? "transparent";
  const borderColor = style?.borderColor ?? "transparent";
  const borderWidth = (style?.borderWidth as number) ?? 0;
  const borderRadius = (style?.borderRadius as number) ?? 0;
  let mode: Mode = "vertical";
  let daysArray = [1, 2, 3, 4];
  if (currentWidth / screenDimension.width > 0.285) {
    if (currentHeight / screenDimension.height > 0.213) mode = "vertical";
    else mode = "horizontal";
  } else if (
    currentWidth / screenDimension.width > 0.2 &&
    currentWidth / screenDimension.width < 0.285
  ) {
    if (currentHeight / screenDimension.height > 0.195) mode = "vertical";
    else mode = "horizontal";
  } else if (currentHeight / screenDimension.height < 0.195) mode = "minimized";

  if (
    currentHeight / screenDimension.height < 0.213 ||
    (mode === "horizontal" && currentWidth / screenDimension.width < 0.285)
  ) {
    daysArray = [1];
  }

  // Calculate font size based on config.width
  const fontSize = calculateTitleFontSize(currentWidth, currentHeight);

  const getWeatherIcon = (value: WeatherCondition) => {
    if (value === "Sunny") {
      return day;
    } else if (value === "PartlyCloudy") {
      return partlyCloudy;
    } else if (value === "Cloudy") {
      return cloudy;
    } else if (value === "Rainy") {
      return rainy;
    } else if (value === "Snowy") {
      return snowy;
    }
  };

  const weekdays =
    currentWidth / screenDimension.width < 0.2 &&
    currentWidth / screenDimension.width > 0.135
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

  const currentDate = new Date();
  const currentDayOfWeek = currentDate.getDay();

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return currentDate.toLocaleDateString("en-US", options);
  };
  const getWeekday = (index: number) => {
    const indexing = currentDayOfWeek + index;
    return weekdays[indexing % 7];
  };

  const classes = generateClasses({
    left,
    top,
    currentWidth,
    currentHeight,
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius,
    mode,
    fontSize,
    screenDimension,
  });

  const defaultData: WeatherWidgetData = {
    days: [
      {
        index: 0,
        temperature: "25°C",
        tempHigh: "27°C",
        tempLow: "19°C",
        condition: "Sunny",
      } as WeatherData,
    ].concat(
      daysArray.map((dayIndex) => ({
        index: dayIndex,
        tempHigh: "20°C",
        tempLow: "14°C",
        condition: "PartlyCloudy" as const,
      }))
    ),
    locationName: "City Name",
  };

  const days: WeatherData[] = data?.days
    ? data.days.slice(1)
    : defaultData.days.slice(1);
  const dataToday = data?.days?.[0] ?? defaultData.days[0];
  const locationName = data?.locationName ?? "City Name";

  return (
    <>
      {mode === "vertical" && (
        <div className={classes.container}>
          <VerticalWeatherTitle
            classes={classes}
            getWeatherIcon={getWeatherIcon}
            currentDate={getCurrentDate()}
            locationName={locationName}
            dataToday={dataToday}
          />
          <Days
            classes={classes}
            daysArray={days}
            mode={mode}
            currentWidth={currentWidth}
            currentHeight={currentHeight}
            screenDimension={screenDimension}
            getWeekday={getWeekday}
            getWeatherIcon={getWeatherIcon}
          />
        </div>
      )}
      {mode === "horizontal" && (
        <div className={classes.container}>
          <HorizontalWeatherTitle
            classes={classes}
            getWeatherIcon={getWeatherIcon}
            currentDate={getCurrentDate()}
            locationName={locationName}
            dataToday={dataToday}
          />
          <Days
            classes={classes}
            daysArray={days}
            mode={mode}
            currentHeight={currentHeight}
            currentWidth={currentWidth}
            screenDimension={screenDimension}
            getWeatherIcon={getWeatherIcon}
            getWeekday={getWeekday}
          />
        </div>
      )}
      {mode === "minimized" && (
        <MinimizedWeatherTitle
          classes={classes}
          getWeatherIcon={getWeatherIcon}
          getWeekday={getWeekday}
          locationName={locationName}
          dataToday={dataToday}
        />
      )}
    </>
  );
};

export default Weather;
