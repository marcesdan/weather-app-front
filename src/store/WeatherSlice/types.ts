export type WeatherData = {
  city: string;
  lat: number; // Latitude of the location, decimal (−90; 90)
  lon: number; // Longitude of the location, decimal (-180; 180)
  timezone: string; // Timezone name for the requested location
  timezone_offset: number; // Shift in seconds from UTC
  current: {
    dt: number; // Current time, Unix, UTC
    sunrise: number; // Sunrise time, Unix, UTC (optional, not present for polar areas)
    sunset: number; // Sunset time, Unix, UTC (optional, not present for polar areas)
    temp: number; // Temperature, Celsius
    feels_like: number; // Feels-like temperature, Celsius
    pressure: number; // Atmospheric pressure on the sea level, hPa
    humidity: number; // Humidity, %
    dew_point: number; // Dew point temperature, Celsius
    uvi: number; // UV index
    clouds: number; // Cloudiness, %
    visibility: number; // Average visibility, meters
    wind_speed: number; // Wind speed, meters/second
    wind_gust: number; // Wind gust speed, meters/second (optional)
    wind_deg: number; // Wind direction, degrees (meteorological)
    rain?: {
      "1h": number; // Precipitation, mm/hour (optional)
    };
    snow?: {
      "1h": number; // Precipitation, mm/hour (optional)
    };
    weather: WeatherDescription[]; // List of weather descriptions
  };

  minutely?: {
    // Minute forecast weather data (optional)
    dt: number; // Time of the forecasted data, Unix, UTC
    precipitation: number; // Precipitation, mm/hour
  }[];

  hourly: {
    dt: number; // Time of the forecasted data, Unix, UTC
    temp: number; // Temperature, Celsius
    feels_like: number; // Feels-like temperature, Celsius
    pressure: number; // Atmospheric pressure on the sea level, hPa
    humidity: number; // Humidity, %
    dew_point: number; // Dew point temperature, Celsius
    uvi: number; // UV index
    clouds: number; // Cloudiness, %
    visibility: number; // Average visibility, meters
    wind_speed: number; // Wind speed, meters/second
    wind_gust: number; // Wind gust speed, meters/second (optional)
    wind_deg: number; // Wind direction, degrees (meteorological)
    pop: number; // Probability of precipitation (0-1)
    rain?: {
      "1h": number; // Precipitation, mm/hour (optional)
    };
    snow?: {
      "1h": number; // Precipitation, mm/hour (optional)
    };
    weather: WeatherDescription[]; // List of weather descriptions
  }[];
  daily: {
    dt: number; // Time of the forecasted data, Unix, UTC
    sunrise: number; // Sunrise time, Unix, UTC (optional, not present for polar areas)
    sunset: number; // Sunset time, Unix, UTC (optional, not present for polar areas)
    moonrise: number; // Time of moonrise, Unix, UTC (optional)
    moonset: number; // Time of moonset, Unix, UTC (optional)
    moon_phase: number; // Moon phase (0-1)
    summary: string; // Human-readable description of the weather conditions for the day
    temp: number;
    feels_like: number;
    pressure: number; // Atmospheric pressure on the sea level, hPa
    humidity: number; // Humidity, %
    dew_point: number; // Dew point temperature, Celsius
    wind_speed: number; // Wind speed, meters/second
    wind_gust: number; // Wind gust speed, meters/second (optional)
    wind_deg: number; // Wind direction, degrees (meteorological)
    clouds: number; // Cloudiness, %
    uvi: number; // Maximum UV index for the day
    pop: number; // Probability of precipitation (0-1)
    rain: number; // Precipitation volume, mm (optional)
    snow: number; // Snow volume, mm (optional)
    weather: WeatherDescription[]; // List of weather descriptions
  }[];
};

export type WeatherDescription = {
  id: number; // Weather condition ID
  main: string; // Short weather condition name (e.g., "Rain", "Clouds")
  description: string; // Detailed weather condition description
  icon: string; // Weather icon code for representation
};
