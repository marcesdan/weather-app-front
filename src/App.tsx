import { lazy, Suspense } from "react";
import { Navigate, Route } from "react-router-dom";
import { createAnimation, IonApp, IonRouterOutlet, setupIonicReact, type AnimationBuilder } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Home from "./pages/home";
import Cities from "./pages/cities";
import Settings from "./pages/settings";
import { ErrorPage, NotFound } from "./pages/error";
import { useAlertWatch } from "./lib/notify";
import { SkyLayer } from "./components/sky";

setupIonicReact();

// Pages are transparent over the shared sky, so a slide would show both at once. Cross-fade in sequence instead:
// the old page fades out, then the new one fades in. Reduced motion: Ionic skips animations when asked by the OS.
const fadeThrough: AnimationBuilder = (_base, opts: { enteringEl: HTMLElement; leavingEl?: HTMLElement }) => {
  const root = createAnimation().fill("both");
  root.addAnimation(createAnimation().addElement(opts.enteringEl).beforeRemoveClass("ion-page-invisible").fromTo("opacity", "0", "1").delay(110).duration(200).easing("cubic-bezier(0.16, 1, 0.3, 1)"));
  if (opts.leavingEl) root.addAnimation(createAnimation().addElement(opts.leavingEl).fromTo("opacity", "1", "0").duration(110).easing("ease-in"));
  return root;
};

// Leaflet and the map canvas only load when someone opens the observatory.
const Observatory = lazy(() => import("./pages/observatory"));

export default function App() {
  useAlertWatch();
  return (
    <IonApp>
      <IonReactRouter>
        <SkyLayer />
        <IonRouterOutlet animation={fadeThrough}>
          <Route path="/" element={<Home />} />
          <Route path="/lugar/:id" element={<Home />} />
          {/* The week now lives on the home screen; old links land there. */}
          <Route path="/dias" element={<Navigate to="/" replace />} />
          <Route path="/ajustes" element={<Settings />} />
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
