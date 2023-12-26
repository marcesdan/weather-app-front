import { WeatherIcon } from "@/components/atoms";
import { useHorizontalScroll } from "@/hooks";
import { Weather } from "@/store/WeatherSlice";
import dayjs from "dayjs";
import { IoRainyOutline } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import styled from "styled-components";

export default function NextHorusList({ hours }: { hours: Weather["hourly"] }) {
  const containerRef = useHorizontalScroll();
  if (!hours?.length) return <Skeleton count={10} width="100%" />;
  return (
    <HoursContainer ref={containerRef}>
      {hours.map((hour) => (
        <HourContainer key={hour.dt}>
          <Hour>{dayjs.unix(hour.dt).format("H [hs]")}</Hour>
          <WeatherIcon
            path={hour.weather?.[0]?.icon}
            description={hour.weather?.[0]?.description}
          />
          <WeatherDetails>
            <Temperature>{Math.round(hour.temp)}°C</Temperature>
            <WeatherDetail>
              <IoRainyOutline />
              {Math.floor(hour.pop) * 100}%
            </WeatherDetail>
          </WeatherDetails>
        </HourContainer>
      ))}
    </HoursContainer>
  );
}

const HoursContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 20px;
  margin: 0 -50px 0 -50px;
  padding: 0 50px 0 50px;
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: 1px;
  cursor: pointer;
  width: 100%;
`;

const HourContainer = styled.div`
  background: linear-gradient(to right, #225bba, #6ca9fa);
  height: 140px;
  width: 65px;
  border-radius: 10px;
  padding: 20px 10px;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
`;

const Hour = styled.div`
  font-size: 1.2em;
  white-space: nowrap;
  color: #e9f8ff;
`;

const Temperature = styled.span`
  width: 100%;
  text-align: center;
  font-size: 1.2em;
  color: #e9f8ff;
`;

const WeatherDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  color: #e9f8ff;
`;

const WeatherDetail = styled.span`
  display: flex;
  gap: 5px;
  align-items: center;
  font-size: 0.9em;
  padding-top: 4px;
`;
