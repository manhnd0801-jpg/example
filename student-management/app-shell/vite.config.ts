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
        pbc_auth:               "http://localhost:3000/remotes/pbc-auth/assets/remoteEntry.js",
        pbc_student_management: "http://localhost:3000/remotes/pbc-student-management/assets/remoteEntry.js",
        pbc_class_management:   "http://localhost:3000/remotes/pbc-class-management/assets/remoteEntry.js",
        pbc_course_management:  "http://localhost:3000/remotes/pbc-course-management/assets/remoteEntry.js",
        pbc_subject_management: "http://localhost:3000/remotes/pbc-subject-management/assets/remoteEntry.js",
        pbc_notification:       "http://localhost:3000/remotes/pbc-notification/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom", "antd"],
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      "/remotes/pbc-auth":               { target: "http://localhost:3011", rewrite: (p) => p.replace("/remotes/pbc-auth", "") },
      "/remotes/pbc-student-management": { target: "http://localhost:3012", rewrite: (p) => p.replace("/remotes/pbc-student-management", "") },
      "/remotes/pbc-class-management":   { target: "http://localhost:3013", rewrite: (p) => p.replace("/remotes/pbc-class-management", "") },
      "/remotes/pbc-course-management":  { target: "http://localhost:3014", rewrite: (p) => p.replace("/remotes/pbc-course-management", "") },
      "/remotes/pbc-subject-management": { target: "http://localhost:3015", rewrite: (p) => p.replace("/remotes/pbc-subject-management", "") },
      "/remotes/pbc-notification":       { target: "http://localhost:3016", rewrite: (p) => p.replace("/remotes/pbc-notification", "") },
    },
  },
  build: { target: "esnext" },
});
