import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { SkeletonTheme } from "react-loading-skeleton";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/es";
import "react-loading-skeleton/dist/skeleton.css";

import { RootLayout } from "@/components/layouts";
import {
  Forecast,
  Home,
  NotFound,
  Error,
  NextDays,
  OtherCities,
} from "./pages";
import { navigationService } from "@/utils";

dayjs.extend(localizedFormat);
dayjs.locale("es");

export default function App() {
  const navigate = useNavigate();
  useEffect(() => {
    navigationService.setNavigate(navigate);
  }, [navigate]);
  return (
    <SkeletonTheme baseColor="#b0d7fe" highlightColor="#c3e5fc">
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="horas" element={<Forecast />} />
          <Route path="dias" element={<NextDays />} />
        </Route>
        <Route path="/ciudades" element={<OtherCities />} />
        <Route path="/error" element={<Error />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SkeletonTheme>
  );
}
