import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowBack, IoIosMore } from "react-icons/io";
import styled from "styled-components";
import { CurrentLocation, CurrentWeather } from "@/components/organisms";

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
`;

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <HeaderContainer>
      {location.pathname !== "/" && (
        <IconButton onClick={() => navigate(-1)}>
          <IoIosArrowBack size={24} />
        </IconButton>
      )}
      <div>
        <CurrentLocation />
        <CurrentWeather />
      </div>
      <IconButton>
        <IoIosMore size={24} />
      </IconButton>
    </HeaderContainer>
  );
}
