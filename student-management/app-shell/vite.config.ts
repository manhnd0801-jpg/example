// app-shell/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// Port convention (khớp với docker-compose.yml):
//   App Shell:                 3000 (dev server)
//   pbc-auth-ui:               3011
//   pbc-student-management-ui: 3012
//   pbc-class-management-ui:   3013
//   pbc-course-management-ui:  3014
//   pbc-subject-management-ui: 3015
//   pbc-notification-ui:       3016

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "app_shell",
      remotes: {
        // Dev: proxy qua /remotes/* → PBC UI dev server
        // Prod: trỏ thẳng vào CDN/nginx của từng PBC UI
        pbc_auth:               "http://localhost:3000/remotes/pbc-auth/assets/remoteEntry.js",
        pbc_student_management: "http://localhost:3000/remotes/pbc-student-management/assets/remoteEntry.js",
        pbc_class_management:   "http://localhost:3000/remotes/pbc-class-management/assets/remoteEntry.js",
        pbc_course_management:  "http://localhost:3000/remotes/pbc-course-management/assets/remoteEntry.js",
        pbc_subject_management: "http://localhost:3000/remotes/pbc-subject-management/assets/remoteEntry.js",
        pbc_notification:       "http://localhost:3000/remotes/pbc-notification/assets/remoteEntry.js",
      },
      // R-18: shared phải là object với singleton: true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shared: {
        react:       { singleton: true, requiredVersion: "^18.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
        antd:        { singleton: true, requiredVersion: "^5.0.0" },
      } as any,
    }),
  ],
  resolve: {
    alias: {
      // R-07: import từ @shared/shared-events → shared/shared-events/index.ts
      "@shared/shared-events": "../shared/shared-events/index.ts",
    },
  },
  server: {
    port: 3000,
    cors: true,
    proxy: {
      // Dev mode: proxy /remotes/<pbc>/ → PBC UI dev server
      "/remotes/pbc-auth":               { target: "http://localhost:3011", rewrite: (p) => p.replace("/remotes/pbc-auth", ""),               changeOrigin: true },
      "/remotes/pbc-student-management": { target: "http://localhost:3012", rewrite: (p) => p.replace("/remotes/pbc-student-management", ""), changeOrigin: true },
      "/remotes/pbc-class-management":   { target: "http://localhost:3013", rewrite: (p) => p.replace("/remotes/pbc-class-management", ""),   changeOrigin: true },
      "/remotes/pbc-course-management":  { target: "http://localhost:3014", rewrite: (p) => p.replace("/remotes/pbc-course-management", ""),  changeOrigin: true },
      "/remotes/pbc-subject-management": { target: "http://localhost:3015", rewrite: (p) => p.replace("/remotes/pbc-subject-management", ""), changeOrigin: true },
      "/remotes/pbc-notification":       { target: "http://localhost:3016", rewrite: (p) => p.replace("/remotes/pbc-notification", ""),       changeOrigin: true },
    },
  },
  build: {
    target: "esnext",
    minify: false,
  },
});
