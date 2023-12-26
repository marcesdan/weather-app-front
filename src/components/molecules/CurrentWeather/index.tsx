import styled from "styled-components";
import { WeatherDetails } from "@/components/molecules";
import { Weather } from "@/store/WeatherSlice/types";

export default function CurrentWeather({
  currentWeather,
}: {
  currentWeather: Weather;
}) {
  return (
    <CurrentWeatherContainer>
      <WeatherDetails weather={currentWeather} />
    </CurrentWeatherContainer>
  );
}

const CurrentWeatherContainer = styled.div`
  background: #225bba;
  background: linear-gradient(to right, #225bba, #6ca9fa);
  border-radius: 10px;
  padding: 20px;
  padding-top: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
`;
