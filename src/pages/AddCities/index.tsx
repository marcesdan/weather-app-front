import styled from "styled-components";

import {
  ExistingCitiesList,
  PrefetchedCitiesList,
} from "@/components/molecules";
import { BackButton } from "@/components/organisms";
import RootContainer from "@/styles/RootContainer";

export default function OtherCities() {
  return (
    <ExtendedRootContainer>
      <Header>
        <BackButton />
        <Title>Ciudades</Title>
        <div></div>
      </Header>
      <PrefetchedCitiesList />
      <ExistingCitiesList />
    </ExtendedRootContainer>
  );
}
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px;
  margin-bottom: 10px;
`;

const Title = styled.h1`
  font-size: 1.3em;
  text-align: center;
  font-weight: 500;
`;

const ExtendedRootContainer = styled(RootContainer)`
  max-width: 500px;
`;
