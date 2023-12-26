import styled from "styled-components";

const iconUrl = import.meta.env.VITE_WEATHER_ICONS_URL;

type WeatherIconProps = {
  path: string;
  size?: number;
  description?: string;
};

export default function WeatherIcon({
  path,
  size = 2,
  description = "Weather icon",
}: WeatherIconProps) {
  return (
    <IconWrapper>
      <StyledImg src={`${iconUrl}${path}@${size}x.png`} alt={description} />
    </IconWrapper>
  );
}

const IconWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  overflow: hidden;
`;

const StyledImg = styled.img`
  object-fit: cover;
  width: 100%;
  height: 100%;
  margin: -10px 0 -10px 0;
`;
