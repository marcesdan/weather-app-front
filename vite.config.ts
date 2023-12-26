import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "src/setupTests",
    mockReset: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
      components: `${path.resolve(__dirname, "./src/components/")}`,
      services: `${path.resolve(__dirname, "./src/services/")}`,
      utils: `${path.resolve(__dirname, "./src/utils/")}`,
      store: `${path.resolve(__dirname, "./src/store/")}`,
      hooks: `${path.resolve(__dirname, "./src/hooks/")}`,
    },
  },
});
