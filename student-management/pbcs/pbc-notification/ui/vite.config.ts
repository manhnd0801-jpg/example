// Hai mode hoạt động:
//
// 1. npm run dev  → Vite dev server tại http://localhost:3016
//    index.html → src/main.tsx → StandaloneApp.tsx
//
// 2. npm run build → Vite build Module Federation remote
//    Output: dist/assets/remoteEntry.js
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
        './bootstrap':              './src/bootstrap.ts',
        './NotificationBellSlot':   './src/slots/NotificationBellSlot',
        './NotificationListSlot':   './src/slots/NotificationListSlot',
        './AuditLogSlot':           './src/slots/AuditLogSlot',
      },
      shared: {
        react:       { singleton: true, requiredVersion: "^18.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
        antd:        { singleton: true, requiredVersion: "^5.0.0" },
      },
    }),
  ],
  server: { port: 3016 },
  build: { target: 'esnext' },
});
