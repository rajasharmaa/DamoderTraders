import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "damodertraders-z8yc.onrender.com",
      "damodertraders.onrender.com",
      "localhost",
      "127.0.0.1",
      "0.0.0.0"
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add build configuration for production
  build: {
    outDir: "dist",
    sourcemap: mode === "development", // Only generate sourcemaps in development
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@mui/material", "@emotion/react", "@emotion/styled"],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
  },
  // Add preview server config for testing production build
  preview: {
    host: true,
    port: 8080,
    allowedHosts: ["damodertraders-z8yc.onrender.com"],
  },
}));
