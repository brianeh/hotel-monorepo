import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: "0.0.0.0", // Allow access from outside container
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://hotel-api-rest:8080/HotelReservation-war",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
