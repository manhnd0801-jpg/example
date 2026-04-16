// AI-GENERATED
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "app_shell",
      remotes: {
        // Dùng proxy path — cùng origin với app-shell, không có CORS
        // nginx proxy /remote/pbc-auth/ → pbc-auth-ui:3011/
        pbc_auth: "http://localhost:3010/remote/pbc-auth/assets/remoteEntry.js",
      },
      shared: {
        react: { singleton: true, requiredVersion: "^18.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
        antd: { singleton: true, requiredVersion: "^5.0.0" },
      },
    }),
  ],
  server: {
    port: 3010,
    cors: true,
    proxy: {
      // Dev mode: proxy /remote/pbc-auth/ → localhost:3011
      "/remote/pbc-auth": {
        target: "http://localhost:3011",
        rewrite: (path) => path.replace(/^\/remote\/pbc-auth/, ""),
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "esnext",
    minify: false,
  },
});
