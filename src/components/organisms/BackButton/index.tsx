import { useLocation, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import IconButton from "@/styles/IconButton";
import styled from "styled-components";

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <IconButtonContainer>
      {location.pathname !== "/" ? (
        <IconButton onClick={() => navigate(-1)}>
          <IoMdArrowRoundBack size={24} />
        </IconButton>
      ) : (
        <div />
      )}
    </IconButtonContainer>
  );
}

const IconButtonContainer = styled.div`
  width: 24px; // The width of the IconButton
  height: 24px; // The height of the IconButton
`;
