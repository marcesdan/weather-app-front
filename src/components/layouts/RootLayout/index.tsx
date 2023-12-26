import { Outlet } from "react-router-dom";
import { Header } from "@/components/organisms";
import RootContainer from "@/styles/RootContainer";
import { Footer } from "@/components/atoms";

export default function RootLayout() {
  return (
    <RootContainer>
      <Header />
      <Outlet />
      <Footer />
    </RootContainer>
  );
}
