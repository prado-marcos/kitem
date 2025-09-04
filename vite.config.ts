import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:8000',
        target: 'https://back-kitem-e12u.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
});
