import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { weatherRequest } from "@/store/WeatherSlice";
import {
  prefetchCityRequest,
  selectPrefetchedCities,
  selectPrefetchedStatus,
} from "@/store/CitiesSlice";
import { debounce } from "lodash-es";
import { AddCitySelect, Button } from "@/components/styles";

export type AddCityPayload = {
  lat: number;
  lon: number;
  city: string;
};

const PrefetchedCitiesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const prefetchedCities = useAppSelector(selectPrefetchedCities);
  const prefetchedStatus = useAppSelector(selectPrefetchedStatus);
  const [cityToAdd, setCityToAdd] = useState<string>("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((nextValue) => dispatch(prefetchCityRequest(nextValue)), 1000),
    []
  );
  const prefetchedCitiesOptions = Object.entries(prefetchedCities).map(
    ([id, { city, state, country }]) => ({
      value: id,
      label: `${city}${state ? `, ${state}` : ""}, ${country}`,
    })
  );
  const handleInputChange = (newValue: string) => {
    if (newValue.trim()) debouncedSave(newValue);
  };
  const handleChange = ({ value }: any) => {
    setCityToAdd(value);
  };
  const handleSubmit = () => {
    dispatch(weatherRequest(prefetchedCities[cityToAdd]));
  };
  return (
    <Container>
      <Label htmlFor="city-select">Seleccione una ciudad</Label>
      <SelectContainer>
        <AddCitySelect
          id="city-select"
          aria-label="Select a city"
          isLoading={prefetchedStatus === "loading"}
          loadingMessage={() => "Cargando..."}
          placeholder="Ingrese una ciudad"
          noOptionsMessage={() =>
            ({
              loading: "Cargando...",
              idle: "Comenzá a escribir y las ciudades irán apareciendo",
              success: "No se han encontrado resultados",
              "not found": "No se han encontrado resultados",
              failed:
                "Lo sentimos, hubo un error, volvé a intentar en unos minutos",
            })[prefetchedStatus]
          }
          options={prefetchedCitiesOptions}
          onInputChange={handleInputChange}
          onChange={handleChange}
        />
        <Button disabled={!cityToAdd} onClick={handleSubmit}>
          Agregar
        </Button>
      </SelectContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
  @media (min-width: 768px) {
    max-width: 800px;
  }
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
`;

const SelectContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 8px;
  flex-wrap: wrap;
  @media (min-width: 420px) {
    flex-wrap: nowrap;
  }
`;

export default PrefetchedCitiesList;
