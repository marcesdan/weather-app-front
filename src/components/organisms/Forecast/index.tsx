import React from "react";
import styled from "styled-components";
import {
  WiDaySunny,
  WiDayCloudy,
  WiCloudy,
  WiRain,
  WiSnow,
  WiFog,
} from "react-icons/wi";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const ForecastContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 20px;
`;

const HourContainer = styled.div`
  background-color: #f0f8ff;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const Hour = styled.span`
  font-size: 1.2em;
  color: #333;
`;

const WeatherIcon = styled.div`
  color: #ffcc00;
  font-size: 2em;
`;

const Temperature = styled.span`
  font-size: 1.2em;
  color: #333;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  text-align: left;
`;

const ForecastLink = styled(Link)`
  text-align: right;
  display: flex;
  align-items: center;
  gap: 5px;
`;

type WeatherCondition = "Sunny" | "Cloudy" | "Rain" | "Snow" | "Fog";

export default function Forecast() {
  // Replace with your weather data
  const forecastData = [
    { hour: "8:00", temperature: 20, condition: "Sunny" as WeatherCondition },
    { hour: "9:00", temperature: 22, condition: "Cloudy" as WeatherCondition },
    // Add more forecast data...
  ];

  const weatherIcons: Record<WeatherCondition, JSX.Element> = {
    Sunny: <WiDaySunny />,
    Cloudy: <WiDayCloudy />,
    Rain: <WiRain />,
    Snow: <WiSnow />,
    Fog: <WiFog />,
  };

  return (
    <>
      <TitleContainer>
        <Title>Hoy</Title>
        <ForecastLink to="/forecast">
          Pronóstico a 7 días <FiChevronRight />
        </ForecastLink>
      </TitleContainer>
      <ForecastContainer>
        {forecastData.map((data, index) => (
          <HourContainer key={index}>
            <Hour>{data.hour}</Hour>
            <WeatherIcon>
              {weatherIcons[data.condition] || <WiCloudy />}
            </WeatherIcon>
            <Temperature>{data.temperature}°C</Temperature>
          </HourContainer>
        ))}
      </ForecastContainer>
    </>
  );
}
