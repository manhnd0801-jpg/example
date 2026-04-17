// AI-GENERATED
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'pbc_class_management',
      filename: 'remoteEntry.js',
      exposes: {
        './bootstrap':      './src/bootstrap.ts',
        './ClassListSlot':  './src/slots/ClassListSlot',
        './ClassFormSlot':  './src/slots/ClassFormSlot',
        './ClassDetailSlot':'./src/slots/ClassDetailSlot',
        './ClassAssignSlot':'./src/slots/ClassAssignSlot',
      },
      shared: ['react', 'react-dom', 'antd'],
    }),
  ],
  server: { port: 3013 },
  build: { target: 'esnext' },
});
