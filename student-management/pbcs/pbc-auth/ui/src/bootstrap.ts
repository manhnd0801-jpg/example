// Bootstrap entry — export default cho App Shell (Module Federation)
// App Shell load './bootstrap' để mount PBC vào login-page mount point
import React from 'react';
import LoginSlot from './slots/LoginSlot';
import type { LoginResponseData } from './types';

const TENANT_ID = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DEV_TENANT_ID) ?? 'dev-tenant';

// Wrapper component: sau khi login thành công → redirect về /students
const LoginBootstrap: React.FC = () =>
  React.createElement(LoginSlot, {
    tenantId: TENANT_ID,
    onLoginSuccess: (_data: LoginResponseData) => {
      window.location.replace('/students');
    },
  });

export default LoginBootstrap;
export * from './index';
