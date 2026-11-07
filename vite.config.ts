import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

// `vite build --mode native` (Capacitor) vs `vite build` (web): `if (__NATIVE__)` branches of the other platform are dropped.
export default defineConfig(({ mode }) => ({
  define: { __NATIVE__: JSON.stringify(mode === "native") },
  // Dev serves the worker from /src/sw.ts; this header lets it control the whole site like /sw.js does in production.
  server: { port: 4000, headers: { "Service-Worker-Allowed": "/" } },
  build: {
    outDir: "dist",
    sourcemap: true,
    // The service worker is a second entry emitted at /sw.js (root scope); it shares src/lib chunks with the page.
    rollupOptions: {
      input: { index: path.resolve(import.meta.dirname, "index.html"), sw: path.resolve(import.meta.dirname, "src/sw.ts") },
      // Ionic ships without "sideEffects": false, so every component (alert, select, datetime…) landed in the bundle.
      // Its React proxies register each custom element when used, so unused ones can be dropped. CSS keeps its side effects.
      treeshake: { moduleSideEffects: (id) => !/node_modules\/(\.pnpm\/[^/]+\/node_modules\/)?@ionic\/(core|react)\//.test(id) || id.endsWith(".css") },
      output: { entryFileNames: (c) => (c.name === "sw" ? "sw.js" : "assets/[name]-[hash].js") },
    },
  },
  plugins: [react(), tailwindcss()],
  test: { include: ["src/**/*.test.ts"], environment: "node" },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
}));
