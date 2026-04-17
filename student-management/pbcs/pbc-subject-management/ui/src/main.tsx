// Entry point của pbc-subject-management UI
// - npm run dev  → render StandaloneApp để chạy/test độc lập
// - npm run build → Vite build remoteEntry.js cho Module Federation (App Shell load)
import React from 'react';
import ReactDOM from 'react-dom/client';
import StandaloneApp from './StandaloneApp';
import './styles/design-tokens.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StandaloneApp />
  </React.StrictMode>,
);
