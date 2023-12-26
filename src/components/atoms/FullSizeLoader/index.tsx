import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const FullPageSplash = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom, #b9dbfb, #6eb9f0);

  &:after {
    content: " ";
    display: block;
    width: 60px;
    height: 60px;
    margin: 1px;
    border-radius: 50%;
    border: 5px solid #fff; // Change this to your preferred spinner color
    border-color: #fff transparent #fff transparent;
    animation: ${spin} 1.2s linear infinite;
  }
`;

export default function SplashScreen() {
  return <FullPageSplash />;
}
