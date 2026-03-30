import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api-bdcourier': {
        target: 'https://api.bdcourier.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-bdcourier/, ''),
      },
      '/api-steadfast': {
        target: 'https://portal.packzy.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-steadfast/, ''),
      },
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
