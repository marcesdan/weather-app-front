import styled from "styled-components";
import { FiX } from "react-icons/fi";
import { removeCity } from "@/store/WeatherSlice"; // import the removeCity action
import { useAppDispatch, useAppSelector } from "@/hooks";
import { selectOtherCitiesWeather } from "@/store/WeatherSlice/selectors";

export default function ExistingCities() {
  const dispatch = useAppDispatch();
  const otherCities = useAppSelector(selectOtherCitiesWeather);
  if (!otherCities?.length) return null;
  return (
    <>
      <Subtitle>Ciudades agregadas</Subtitle>
      <CityList>
        {otherCities.map(({ city }) => (
          <CityItem key={city}>
            <CityName>{city}</CityName>
            <RemoveButton onClick={() => dispatch(removeCity(city))}>
              Quitar <FiX size={24} />
            </RemoveButton>
          </CityItem>
        ))}
      </CityList>
    </>
  );
}

const Subtitle = styled.h3`
  text-align: center;
  font-size: 0.9em;
  font-weight: 400;
  margin: 0;
  margin-top: 36px;
`;

const CityList = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: center;
  list-style: none;
  padding: 0;
  text-align: center;
`;

const CityItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #b9b9b9;
`;

const CityName = styled.span`
  font-size: 1rem;
`;

const RemoveButton = styled.button`
  display: flex;
  gap: 8px;
  align-items: center;
  background: none;
  border: none;
  color: #225bba;
  cursor: pointer;
`;
