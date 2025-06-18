import useFetch from "../../hooks/useFetch";
import { WeatherCondition, WeatherWidgetData } from "./Weather";

const iconToConditionLookup: Record<string, WeatherCondition> = {
  snow: "Snowy",
  rain: "Rainy", // TODO add more conditions
  fog: "Cloudy",
  wind: "PartlyCloudy",
  cloudy: "Rainy",
  "partly-cloudy-day": "PartlyCloudy",
  "partly-cloudy-night": "PartlyCloudy",
  "clear-day": "Sunny",
  "clear-night": "Sunny",
};

type GetWeatherResponse = {
  result: {
    city: string;
    currentConditions: {
      conditions: string;
      datetime: string;
      icon: string;
      temp: number;
    };
    days: {
      conditions: string;
      datetime: string;
      icon: keyof typeof iconToConditionLookup;
      temp: number;
      tempmax: number;
      tempmin: number;
    }[];
  };
};

function transformTemperature(temp: number) {
  return Math.round(temp) + "°C";
}

export default function useWeatherHandler(): WeatherWidgetData | null {
  // TODO cache data, fetch every hour

  const branchDeviceInfo = JSON.parse(window.pmJsLib.getDeviceBranchInfo());

  const { json } = useFetch<GetWeatherResponse>(
    process.env.REACT_APP_API_URL + "/api/v1/clients/weather/getWeather",
    {
      method: "POST",
      body: JSON.stringify({ branchID: branchDeviceInfo?.branchID }),
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!json?.result) return null;

  let days = json.result.days.map((day, index) => ({
    index: index,
    temperature: transformTemperature(day.temp),
    tempHigh: transformTemperature(day.tempmax),
    tempLow: transformTemperature(day.tempmin),
    condition: iconToConditionLookup[day.icon],
  }));

  days[0].temperature = transformTemperature(
    json.result.currentConditions.temp
  );

  return { days, locationName: json.result.city };
}
