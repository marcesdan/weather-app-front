import { RootContainer } from "@/components/styles";
import styled from "styled-components";

export default function NotFound() {
  return (
    <RootContainer>
      <Title>404</Title>
      <Subtitle>Page Not Found</Subtitle>
    </RootContainer>
  );
}

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
`;

const Subtitle = styled.h2`
  font-size: 1rem;
`;
