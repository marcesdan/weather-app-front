import { Outlet } from "react-router-dom";
import { Header } from "@/components/organisms";
import { Footer } from "@/components/atoms";
import { Content, RootContainer } from "@/components/styles";

export default function RootLayout() {
  return (
    <RootContainer>
      <Content>
        <Header />
        <Outlet />
      </Content>
      <Footer />
    </RootContainer>
  );
}
