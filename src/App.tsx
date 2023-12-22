import { Route, Routes, useNavigate } from "react-router-dom";
import { RootLayout } from "./components/layouts";
import { Forecast, Home, NotFound, Cities, Error } from "./pages";
import { useEffect } from "react";
import { navigationService } from "@/utils";

export default function App() {
  const navigate = useNavigate();
  useEffect(() => {
    navigationService.setNavigate(navigate);
  }, [navigate]);
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="forecast" element={<Forecast />} />
        <Route path="cities" element={<Cities />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/error" element={<Error />} />
    </Routes>
  );
}
