import styled from "styled-components";

export default function Footer() {
  return (
    <CustomFooter>
      <b>&lt;/&gt; </b> con ❤️ por Marces
    </CustomFooter>
  );
}
const CustomFooter = styled.footer`
  flex-shrink: 0;
  text-align: center;
  font-size: 1rem;
  padding: 20px 0 10px 0;
`;
