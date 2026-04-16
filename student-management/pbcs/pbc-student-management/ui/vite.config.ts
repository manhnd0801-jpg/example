// AI-GENERATED
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'pbc_student_management',
      filename: 'remoteEntry.js',
      exposes: {
        './bootstrap':          './src/bootstrap.ts',
        './StudentListSlot':    './src/slots/StudentListSlot',
        './StudentFormSlot':    './src/slots/StudentFormSlot',
        './StudentDetailSlot':  './src/slots/StudentDetailSlot',
        './StudentStatusSlot':  './src/slots/StudentStatusSlot',
      },
      shared: ['react', 'react-dom', 'antd'],
    }),
  ],
  server: { port: 3012 },
  build: { target: 'esnext' },
});
