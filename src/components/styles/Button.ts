import styled from "styled-components";

export default styled.button`
  background-color: #225bba;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #1a4a8d;
  }
  &:focus {
    outline: none;
  }
  &:disabled {
    opacity: 0.5;
  }
  width: 100%;
  @media (min-width: 420px) {
    width: 33%;
  }
`;
