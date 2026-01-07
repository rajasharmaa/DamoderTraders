import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [react()];

  // Explicit dev-only plugin loading
  if (mode === "development") {
    plugins.push(componentTagger());
  }

  return {
    server: {
      // Cross-platform compatible host
      host: true, // or "0.0.0.0" for explicit IPv4
      port: 8080,
      // Optional: Better for network access
      cors: true,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Optional: Better build config for TypeScript
    build: {
      sourcemap: mode === "development",
      outDir: "dist",
    },
  };
});