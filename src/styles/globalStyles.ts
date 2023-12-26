import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  html, body, #root {
    margin: 0;
    padding: 0;
  }
  body {
    font-family: 'Roboto', sans-serif;
    font-size: 12px;
    @media (min-width: 768px) {
      font-size: 14px;
    }
    background: linear-gradient(to bottom, #b9dbfb, #6eb9f0);
  }
  .flex-1 {
    flex: 1;
    width: 100%;
  }
`;
