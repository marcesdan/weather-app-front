import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource-variable/figtree";
// Ionic: only core + structure (DESIGN rule shared with Astropia); its normalize/typography would override Tailwind.
import "@ionic/react/css/core.css";
import "@ionic/react/css/structure.css";
import "./styles/globals.css";
import "./styles/theme-variables.css";
import App from "./App";
import { mirrorForWorker } from "./lib/places";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: true } } });
mirrorForWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
