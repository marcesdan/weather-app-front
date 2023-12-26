import { HiDotsVertical } from "react-icons/hi";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";

import { CurrentLocation, BackButton } from "@/components/organisms";
import { IconButton } from "@/components/styles";
import { useAppSelector } from "@/hooks";
import { Weather } from "@/store/WeatherSlice/types";
import { selectCurrentWeather } from "@/store/WeatherSlice";
import { CurrentWeather } from "@/components/molecules";

export default function Header() {
  const currentWeather: Weather = useAppSelector(selectCurrentWeather);
  const isLoading = !currentWeather?.current;
  return (
    <HeaderContainer>
      <TopContainer>
        <BackButton />
        <CurrentLocation
          city={currentWeather.city}
          timezoneOffset={currentWeather?.timezone_offset}
        />
        <IconButton>
          <HiDotsVertical size={24} />
        </IconButton>
      </TopContainer>
      {!isLoading ? (
        <CurrentWeather currentWeather={currentWeather} />
      ) : (
        <Skeleton count={12} containerClassName="flex-1" />
      )}
    </HeaderContainer>
  );
}

const HeaderContainer = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
`;

const TopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;
