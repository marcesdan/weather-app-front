import styled from "styled-components";

import { ExistingCities, AddCities } from "@/components/organisms";
import { BackButton } from "@/components/organisms";
import { Footer } from "@/components/atoms";
import { Content, RootContainer } from "@/components/styles";

export default function OtherCities() {
  return (
    <ExtendedRootContainer>
      <Content>
        <Header>
          <BackButton />
          <Title>Ciudades</Title>
          <div />
        </Header>
        <AddCities />
        <ExistingCities />
      </Content>
      <Footer />
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
