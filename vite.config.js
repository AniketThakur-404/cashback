import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: "/",
  plugins: [react()],
  optimizeDeps: {
    exclude: ["date-fns", "pdf-lib", "react-leaflet", "leaflet"],
  },
  build: {
    assetsDir: "",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
      {
        find: /^leaflet$/,
        replacement: path.resolve(__dirname, "./node_modules/leaflet/dist/leaflet-src.esm.js"),
      },
    ],
  },
});

