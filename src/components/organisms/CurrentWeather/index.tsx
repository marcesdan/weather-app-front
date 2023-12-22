import React from "react";
import styled from "styled-components";
import {
  WiDaySunny,
  WiDayCloudy,
  WiCloudy,
  WiRain,
  WiSnow,
  WiFog,
  WiHumidity,
  WiRaindrop,
  WiStrongWind,
} from "react-icons/wi";

type WeatherCondition = "Sunny" | "Cloudy" | "Rain" | "Snow" | "Fog";

const WeatherContainer = styled.div`
  background-color: #f0f8ff;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const WeatherIcon = styled.div`
  color: #ffcc00;
  font-size: 3em;
`;

const Temperature = styled.span`
  font-size: 2em;
  color: #333;
`;

const WeatherDetails = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const WeatherDetail = styled.span`
  display: flex;
  gap: 5px;
  align-items: center;
`;

export default function CurrentWeather() {
  // Replace with your weather data
  const weatherData = {
    temperature: 20,
    precipitation: 50,
    humidity: 80,
    windSpeed: 10,
    condition: "Rain" as WeatherCondition, // 'Sunny', 'Cloudy', 'Rain', 'Snow', 'Fog'
  };

  const weatherIcons = {
    Sunny: <WiDaySunny />,
    Cloudy: <WiDayCloudy />,
    Rain: <WiRain />,
    Snow: <WiSnow />,
    Fog: <WiFog />,
  };

  const WeatherIconComponent = weatherIcons[weatherData.condition] || (
    <WiCloudy />
  );

  return (
    <WeatherContainer>
      <WeatherIcon>{WeatherIconComponent}</WeatherIcon>
      <Temperature>{weatherData.temperature}°C</Temperature>
      <WeatherDetails>
        <WeatherDetail>
          <WiRaindrop />
          {weatherData.precipitation}%
        </WeatherDetail>
        <WeatherDetail>
          <WiHumidity />
          {weatherData.humidity}%
        </WeatherDetail>
        <WeatherDetail>
          <WiStrongWind />
          {weatherData.windSpeed} m/s
        </WeatherDetail>
      </WeatherDetails>
    </WeatherContainer>
  );
}
