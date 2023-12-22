import styled from "styled-components";
import { FiAlertCircle } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";

export default function ErrorPage() {
  return (
    <ErrorContainer>
      <ErrorIcon />
      <ErrorMessage>
        Something is wrong, check your internet connection, or try again in a
        few minutes.
      </ErrorMessage>
      <Link to="/" reloadDocument>
        Try Again
      </Link>
    </ErrorContainer>
  );
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100% - 40px);
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
`;

const ErrorIcon = styled(FiAlertCircle)`
  font-size: 72px;
  color: #dc3545;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.p`
  font-size: 24px;
  color: #212529;
  margin-bottom: 20px;
`;

const Link = styled(RouterLink)`
  display: inline-block;
  padding: 10px 20px;
  color: #fff;
  background-color: #007bff;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;
