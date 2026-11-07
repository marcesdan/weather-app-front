import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import NextDays from "./pages/next-days";
import Cities from "./pages/cities";
import { ErrorPage, NotFound } from "./pages/error";
import { useAlertWatch } from "./lib/notify";

// Leaflet and the map canvas only load when someone opens the observatory.
const Observatory = lazy(() => import("./pages/observatory"));

export default function App() {
  useAlertWatch();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dias" element={<NextDays />} />
      <Route path="/ciudades" element={<Cities />} />
      <Route
        path="/observatory"
        element={
          <Suspense fallback={<p className="p-6 text-muted-foreground">Cargando el mapa…</p>}>
            <Observatory />
          </Suspense>
        }
      />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
