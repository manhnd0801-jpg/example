// AI-GENERATED
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'pbc_course_management',
      filename: 'remoteEntry.js',
      exposes: {
        './bootstrap':       './src/bootstrap.ts',
        './CourseListSlot':  './src/slots/CourseListSlot',
        './CourseFormSlot':  './src/slots/CourseFormSlot',
        './CourseDetailSlot':'./src/slots/CourseDetailSlot',
      },
      shared: ['react', 'react-dom', 'antd'],
    }),
  ],
  server: { port: 3014 },
  build: { target: 'esnext' },
});
