import { WeatherIcon } from "@/components/atoms";
import { Weather } from "@/store/WeatherSlice";
import { IoRainyOutline, IoWaterOutline } from "react-icons/io5";
import { WiStrongWind } from "react-icons/wi";
import styled from "styled-components";

export default function WeatherDetails({
  weather: { current, hourly },
}: {
  weather: Weather;
}) {
  return (
    <>
      <WeatherIcon
        path={current.weather[0]?.icon}
        description={current.weather[0]?.description}
      />
      <Description>{current.weather[0]?.description}</Description>
      <Temperature>{Math.floor(current.temp)}°C</Temperature>
      <Details>
        <WeatherDetail>
          <IoRainyOutline />
          {Math.floor(hourly[0].pop) * 100}%
        </WeatherDetail>
        <WeatherDetail>
          <IoWaterOutline />
          {Math.floor(current.humidity)}%
        </WeatherDetail>
        <WeatherDetail>
          <WiStrongWind />
          {Math.floor(current.wind_speed)} m/s
        </WeatherDetail>
      </Details>
    </>
  );
}

const Temperature = styled.span`
  font-size: 2em;
  color: #fff;
`;

const Details = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  color: #fff;
`;

const WeatherDetail = styled.span`
  display: flex;
  gap: 5px;
  align-items: center;
`;

const Description = styled.p`
  &::first-letter {
    text-transform: uppercase;
  }
  color: #fff;
  font-size: 1.2em;
  margin: 0;
  margin-top: -10px;
`;
