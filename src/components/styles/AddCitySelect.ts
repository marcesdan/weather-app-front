import ReactSelect from "react-select";
import styled from "styled-components";

export default styled(ReactSelect)`
  width: 100%;
  .react-select__control {
    border-color: #1a4a8d;
  }
  .react-select__option--is-selected {
    background-color: #1a4a8d;
    color: white;
  }
  .react-select__option--is-focused {
    background-color: #1a4a8d;
    color: white;
  }
`;
