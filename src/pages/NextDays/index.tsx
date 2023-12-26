import { Footer, WeatherIcon } from "@/components/atoms";
import { BackButton } from "@/components/organisms";
import { Content, RowContainer, RootContainer } from "@/components/styles";
import { useAppSelector } from "@/hooks";
import {
  selectCurrentCity,
  selectCurrentDailyWeather,
} from "@/store/WeatherSlice/selectors";
import dayjs from "dayjs";
import styled from "styled-components";

export default function NextDays() {
  const dailyWeather = useAppSelector(selectCurrentDailyWeather);
  const currentCity = useAppSelector(selectCurrentCity);
  return (
    <RootContainer>
      <Content>
        <RowContainer>
          <BackButton />
          <Title>Próximos días en {currentCity}</Title>
          <div></div>
        </RowContainer>
        <WeatherList>
          {dailyWeather?.map((day) => (
            <WeatherItem key={day.dt}>
              <DayOfWeek>{dayjs.unix(day.dt).format("ddd")}</DayOfWeek>
              <IconContainer>
                <WeatherIcon
                  path={day.weather[0].icon}
                  description={day.weather[0].description}
                />
              </IconContainer>
              <Description>{day.weather[0].description}</Description>
              <span>
                {Math.floor(day.temp.min)}°C / {Math.floor(day.temp.max)}°C
              </span>
            </WeatherItem>
          ))}
        </WeatherList>
      </Content>
      <Footer />
    </RootContainer>
  );
}

const WeatherList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const WeatherItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 10px;
  max-height: 60px;
`;

const DayOfWeek = styled.span`
  font-weight: bold;
`;
const Description = styled.span`
  &::first-letter {
    text-transform: uppercase;
  }
`;

const IconContainer = styled.div`
  max-height: 100px;
`;

const Title = styled.h1`
  font-size: 1.3em;
  text-align: center;
  font-weight: 500;
`;
