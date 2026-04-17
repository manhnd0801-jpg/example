// AI-GENERATED
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// Hai mode hoạt động:
//
// 1. npm run dev  → Vite dev server tại http://localhost:3011
//    index.html → src/main.tsx → StandaloneApp.tsx
//    Render toàn bộ UI với mini shell để test các slot độc lập
//
// 2. npm run build → Vite build Module Federation remote
//    Output: dist/assets/remoteEntry.js
//    App Shell load qua: import('http://localhost:3011/assets/remoteEntry.js')
//    Các slot được expose qua `exposes` bên dưới

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'pbc_auth',
      filename: 'remoteEntry.js',
      exposes: {
        './bootstrap':          './src/bootstrap.ts',
        './LoginSlot':          './src/slots/LoginSlot',
        './ProfileSlot':        './src/slots/ProfileSlot',
        './UserManagementSlot': './src/slots/UserManagementSlot',
      },
      shared: {
        react: { singleton: true, requiredVersion: "^18.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
        antd: { singleton: true, requiredVersion: "^5.0.0" },
      },
    }),
  ],
  server: { port: 3011 },
  build: { target: 'esnext' },
});
