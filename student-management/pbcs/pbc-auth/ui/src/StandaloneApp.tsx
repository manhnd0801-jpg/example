// AI-GENERATED
// Standalone App — dùng khi chạy pbc-auth UI độc lập (npm run dev)
// Đây là App Shell tối giản chỉ cho PBC này, không phải App Shell thật của platform
// Khi deploy lên platform, App Shell thật sẽ load các slot qua Module Federation
import React, { useState } from 'react';
import { ConfigProvider, Layout, Menu, Typography, theme } from 'antd';
import {
  LoginOutlined,
  UserOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import viVN from 'antd/locale/vi_VN';
import LoginSlot from './slots/LoginSlot';
import ProfileSlot from './slots/ProfileSlot';
import UserManagementSlot from './slots/UserManagementSlot';
import type { LoginResponseData, UserDto } from './types';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Tenant ID đọc từ env — không hard-code
// Đặt VITE_DEV_TENANT_ID trong ui/.env khi chạy local
const TENANT_ID = import.meta.env.VITE_DEV_TENANT_ID ?? 'dev-tenant';

type ActiveSlot = 'login' | 'profile' | 'user-management';

const NAV_ITEMS = [
  { key: 'login',           icon: <LoginOutlined />,   label: 'Login Form' },
  { key: 'profile',         icon: <ProfileOutlined />, label: 'Profile' },
  { key: 'user-management', icon: <UserOutlined />,    label: 'User Management' },
];

const StandaloneApp: React.FC = () => {
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>('login');
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);

  const handleLoginSuccess = (data: LoginResponseData) => {
    setCurrentUser(data.user);
    setActiveSlot('profile');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveSlot('login');
  };

  const renderSlot = () => {
    switch (activeSlot) {
      case 'login':
        return (
          <LoginSlot
            tenantId={TENANT_ID}
            onLoginSuccess={handleLoginSuccess}
            onLoginError={(err) => console.error('[standalone] login error:', err)}
          />
        );
      case 'profile':
        return (
          <ProfileSlot
            currentUser={currentUser ?? undefined}
            onLogout={handleLogout}
          />
        );
      case 'user-management':
        return <UserManagementSlot />;
      default:
        return null;
    }
  };

  return (
    <ConfigProvider locale={viVN} theme={{ algorithm: theme.defaultAlgorithm }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--pbc-primary-color, #0d6efd)',
        }}>
          {/* <Title level={5} style={{ color: '#fff', margin: 0 }}>
            pbc-auth — Standalone
          </Title> */}
          {currentUser && (
            <Text style={{ color: 'rgba(255,255,255,0.8)', marginLeft: 'auto' }}>
              {currentUser.username} ({currentUser.role})
            </Text>
          )}
        </Header>

        <Layout>
          <Sider width={220} style={{ background: '#fff' }}>
            <Menu
              mode="inline"
              selectedKeys={[activeSlot]}
              items={NAV_ITEMS}
              onClick={({ key }) => setActiveSlot(key as ActiveSlot)}
              style={{ height: '100%', borderRight: 0 }}
            />
          </Sider>

          <Content style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
            {renderSlot()}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default StandaloneApp;
