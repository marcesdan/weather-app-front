import styled from "styled-components";

import { ExistingCities, AddCities } from "@/components/organisms";
import { BackButton } from "@/components/organisms";
import { Footer } from "@/components/atoms";
import { Content, RootContainer, RowContainer } from "@/components/styles";

export default function OtherCities() {
  return (
    <ExtendedRootContainer>
      <Content>
        <RowContainer>
          <BackButton />
          <Title>Ciudades</Title>
          <div />
        </RowContainer>
        <AddCities />
        <ExistingCities />
      </Content>
      <Footer />
    </ExtendedRootContainer>
  );
}

const Title = styled.h1`
  font-size: 1.3em;
  text-align: center;
  font-weight: 500;
`;

const ExtendedRootContainer = styled(RootContainer)`
  max-width: 500px;
`;
