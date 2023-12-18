import { Outlet } from "react-router-dom"
import styled from "styled-components"
import { CurrentLocation, CurrentWeather } from "../../organisms"

export default function RootLayout() {
  return (
    <RootContainer>
      <CurrentLocation />
      <CurrentWeather />
      <Outlet />
    </RootContainer>
  )
}

const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
`
