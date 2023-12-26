import { Link } from "react-router-dom";
import styled from "styled-components";
import { FiPlus } from "react-icons/fi";
import { useAppSelector } from "@/hooks";
import { selectOtherCitiesWeather } from "@/store/WeatherSlice/selectors";
import { OtherCitiesList } from "@/components/molecules";
import Skeleton from "react-loading-skeleton";
import { IconButton } from "@/components/styles";

export default function OtherCities() {
  const otherCities = useAppSelector(selectOtherCitiesWeather);
  const isLoading = otherCities.some(({ current }) => !current);
  return (
    <PageContainer>
      <TitleContainer>
        <Title>Otras ciudades</Title>
        <Link to="/ciudades">
          <IconButton>
            <FiPlus size={24} />
          </IconButton>
        </Link>
      </TitleContainer>
      {!isLoading ? (
        <OtherCitiesList cities={otherCities} />
      ) : (
        <Skeleton count={12} />
      )}
    </PageContainer>
  );
}

const PageContainer = styled.div`
  margin-top: 16px;
`;

const TitleContainer = styled.div`
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
