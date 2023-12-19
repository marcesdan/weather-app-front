import { Route, Routes } from "react-router-dom";
import { RootLayout } from "./components/layouts";
import { Forecast, Home, NotFound } from "./pages";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="forecast" element={<Forecast />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
