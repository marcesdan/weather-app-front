import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Home from "./pages/home";
import NextDays from "./pages/next-days";
import Cities from "./pages/cities";
import { ErrorPage, NotFound } from "./pages/error";
import { useAlertWatch } from "./lib/notify";
import { SkyLayer } from "./components/sky";

setupIonicReact();

// Leaflet and the map canvas only load when someone opens the observatory.
const Observatory = lazy(() => import("./pages/observatory"));

export default function App() {
  useAlertWatch();
  return (
    <IonApp>
      <IonReactRouter>
        <SkyLayer />
        <IonRouterOutlet>
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
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
