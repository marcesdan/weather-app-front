import { useAppSelector } from "@/hooks";
import { selectCurrentHourlyWeather } from "@/store/WeatherSlice/selectors";
import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import styled from "styled-components";
import NextHorusList from "../../molecules/NextHoursList/index";

export default function Forecast() {
  const hourly = useAppSelector(selectCurrentHourlyWeather);
  return (
    <>
      <TitleContainer>
        <Title>Próximas horas</Title>
        <NextHoursLink to="/dias">
          Pronóstico a 7 días <FiChevronRight />
        </NextHoursLink>
      </TitleContainer>
      <NextHorusList hours={hourly} />
    </>
  );
}

const TitleContainer = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1em;
  font-weight: 600;
  text-align: left;
  color: #225bba;
`;

const NextHoursLink = styled(Link)`
  text-align: right;
  display: flex;
  align-items: center;
  gap: 5px;
  text-decoration: none;
  color: #225bba;
`;
