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
        // Remotes được load động từ pbc-registry.json tại runtime
        // Không hard-code ở đây — xem pbc-loader.ts
      },
      shared: ["react", "react-dom"],
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
