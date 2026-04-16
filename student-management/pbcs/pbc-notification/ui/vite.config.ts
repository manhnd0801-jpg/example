// AI-GENERATED
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'pbc_notification',
      filename: 'remoteEntry.js',
      exposes: {
        './bootstrap':            './src/bootstrap.ts',
        './NotificationBellSlot': './src/slots/NotificationBellSlot',
        './NotificationListSlot': './src/slots/NotificationListSlot',
        './AuditLogSlot':         './src/slots/AuditLogSlot',
      },
      shared: ['react', 'react-dom', 'antd'],
    }),
  ],
  server: { port: 3016 },
  build: { target: 'esnext' },
});
