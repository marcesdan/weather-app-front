import styled from "styled-components";

export default function Footer() {
  return (
    <CustomFooter>
      <b>&lt;/&gt; </b> con ❤️ por marces
    </CustomFooter>
  );
}
const CustomFooter = styled.footer`
  position: sticky;
  bottom: 0;
  padding: 20px 0 10px 0;
  width: 100%;
  text-align: center;
  background: transparent;
  font-size: 1rem;
  color: #000; // Change this to the color you want for the text
`;
