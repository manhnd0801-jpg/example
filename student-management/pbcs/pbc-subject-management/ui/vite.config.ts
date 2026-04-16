// AI-GENERATED
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'pbc_subject_management',
      filename: 'remoteEntry.js',
      exposes: {
        './bootstrap':        './src/bootstrap.ts',
        './SubjectListSlot':  './src/slots/SubjectListSlot',
        './SubjectFormSlot':  './src/slots/SubjectFormSlot',
        './SubjectDetailSlot':'./src/slots/SubjectDetailSlot',
        './SubjectAssignSlot':'./src/slots/SubjectAssignSlot',
      },
      shared: ['react', 'react-dom', 'antd'],
    }),
  ],
  server: { port: 3015 },
  build: { target: 'esnext' },
});
