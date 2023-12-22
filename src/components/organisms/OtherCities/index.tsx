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
import { FiPlus } from "react-icons/fi";

const CitiesContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 20px;
`;

const CityContainer = styled.div`
  background-color: #f0f8ff;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 150px;
`;

const CityName = styled.span`
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

const CitiesLink = styled(Link)`
  text-align: right;
  display: flex;
  align-items: center;
  gap: 5px;
`;

type WeatherCondition = "Sunny" | "Cloudy" | "Rain" | "Snow" | "Fog";

export default function OtherCities() {
  // Replace with your weather data
  const citiesData = [
    {
      city: "Buenos Aires",
      temperature: 20,
      condition: "Sunny" as WeatherCondition,
    },
    {
      city: "New York",
      temperature: 22,
      condition: "Cloudy" as WeatherCondition,
    },
    // Add more cities data...
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
        <Title>Otras ciudades</Title>
        <CitiesLink to="/cities">
          <FiPlus />
        </CitiesLink>
      </TitleContainer>
      <CitiesContainer>
        {citiesData.map((data, index) => (
          <CityContainer key={index}>
            <CityName>{data.city}</CityName>
            <WeatherIcon>
              {weatherIcons[data.condition] || <WiCloudy />}
            </WeatherIcon>
            <Temperature>{data.temperature}°C</Temperature>
          </CityContainer>
        ))}
      </CitiesContainer>
    </>
  );
}
