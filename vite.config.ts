import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "damodertraders-z8yc.onrender.com",
      "localhost",
      "127.0.0.1",
    ],
  },
  plugins: [
    react({
      jsxRuntime: 'automatic', // Add this line
    }), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    jsx: 'automatic', // Add this for JSX handling
  },
  build: {
    rollupOptions: {
      external: ['react', 'react-dom'], // Ensure React is not bundled multiple times
    },
  },
}));
