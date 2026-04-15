// AI-GENERATED
// Slot: login-form — thin wrapper, orchestrate LoginForm component
import React, { useState } from 'react';
import { Card, Typography } from 'antd';
import LoginForm from '../components/business/LoginForm';
import { login } from '../services/pbc-api';
import { emitAuthEvent } from '../hooks/event-handlers';
import type { LoginRequestData, LoginResponseData } from '../types';

const { Title } = Typography;

interface LoginSlotProps {
  tenantId?: string;
  onLoginSuccess?: (data: LoginResponseData) => void;
  onLoginError?: (error: Error) => void;
}

const LoginSlot: React.FC<LoginSlotProps> = ({
  tenantId = 'default',
  onLoginSuccess,
  onLoginError,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginRequestData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await login(values, tenantId);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('tenantId', tenantId);

      // Phát event lên App Shell → forward lên Kafka
      emitAuthEvent('pbc.auth.user.logged-in', {
        userId: res.data.user.id,
        username: res.data.user.username,
        role: res.data.user.role,
      });

      onLoginSuccess?.(res.data);
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      onLoginError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: 'var(--pbc-primary-color, #f0f2f5)',
    }}>
      <Card style={{ width: 400, borderRadius: 'var(--pbc-border-radius, 8px)' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Đăng nhập
        </Title>
        <LoginForm
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onErrorClose={() => setError(null)}
        />
      </Card>
    </div>
  );
};

export default LoginSlot;
