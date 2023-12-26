import styled from "styled-components";
import { Weather } from "@/store/WeatherSlice";
import useHorizontalScroll from "../../../hooks/useHorizontalScroll/index";
import WeatherDetails from "../WeatherDetails/index";

export default function OtherCitiesList({ cities }: { cities: Weather[] }) {
  const ref = useHorizontalScroll();
  return (
    <OtherCitiesContainer ref={ref}>
      {cities.length ? (
        cities.map((weatherOnCity) => (
          <CityContainer key={weatherOnCity.city}>
            <CityName>{weatherOnCity.city}</CityName>
            <WeatherDetails weather={weatherOnCity} />
          </CityContainer>
        ))
      ) : (
        <Message>
          Aún no cargaste otras ciudades, para agregar más, pulse el botón +
        </Message>
      )}
    </OtherCitiesContainer>
  );
}

const OtherCitiesContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 20px;
  margin: 0 -50px 0 -50px;
  padding: 0 50px 0 50px;
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  cursor: pointer;
  width: 100%;
`;

const CityContainer = styled.div`
  background: linear-gradient(to right, #225bba, #6ca9fa);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 150px;
  font-size: 12px;
`;

const CityName = styled.span`
  font-size: 1.3em;
  color: #e9f8ff;
`;

const Message = styled.p`
  color: #333;
  font-size: 16px;
  text-align: center;
`;
