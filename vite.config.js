import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dev mirrors production: the app always calls /api, and the dev server
// proxies it to Express (like nginx does in production).
// API_PROXY_TARGET overrides where the API runs (default port 3000).
const apiTarget = process.env.API_PROXY_TARGET || "http://localhost:3000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 1234,
    strictPort: true,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "build", // EC2 deploy copies build/* to /var/www/html
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Long-lived vendor chunks: app changes don't bust their cache
        manualChunks: {
          react: [
            "react",
            "react-dom",
            "react-router-dom",
            "react-redux",
            "@reduxjs/toolkit",
          ],
          charts: ["recharts"],
        },
      },
    },
  },
});
