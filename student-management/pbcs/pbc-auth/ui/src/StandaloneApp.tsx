// AI-GENERATED
// Standalone App — dùng khi chạy pbc-auth UI độc lập (npm run dev)
// Khi deploy lên platform, App Shell thật sẽ load các slot qua Module Federation
import React, { useState } from 'react';
import { ConfigProvider, Layout, Menu, Typography, theme, Result, Button } from 'antd';
import { LoginOutlined, UserOutlined, ProfileOutlined } from '@ant-design/icons';
import viVN from 'antd/locale/vi_VN';
import LoginSlot from './slots/LoginSlot';
import ProfileSlot from './slots/ProfileSlot';
import UserManagementSlot from './slots/UserManagementSlot';
import type { LoginResponseData, UserDto, UserRole } from './types';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Tenant ID đọc từ env — không hard-code
const TENANT_ID = import.meta.env.VITE_DEV_TENANT_ID ?? 'dev-tenant';

type ActiveSlot = 'login' | 'profile' | 'user-management';

// Các role được phép vào user-management
const USER_MANAGEMENT_ROLES: UserRole[] = ['ADMIN', 'ACADEMIC_STAFF'];

const StandaloneApp: React.FC = () => {
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>('login');
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);

  const canManageUsers = currentUser
    ? USER_MANAGEMENT_ROLES.includes(currentUser.role)
    : false;

  // Chỉ hiện menu item phù hợp với trạng thái đăng nhập và role
  const navItems = [
    // Chưa đăng nhập → chỉ hiện Login
    ...(!currentUser
      ? [{ key: 'login', icon: <LoginOutlined />, label: 'Đăng nhập' }]
      : []),
    // Đã đăng nhập → hiện Profile
    ...(currentUser
      ? [{ key: 'profile', icon: <ProfileOutlined />, label: 'Hồ sơ cá nhân' }]
      : []),
    // Đã đăng nhập + có quyền → hiện User Management
    ...(canManageUsers
      ? [{ key: 'user-management', icon: <UserOutlined />, label: 'Quản lý người dùng' }]
      : []),
  ];

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
        return <ProfileSlot currentUser={currentUser ?? undefined} onLogout={handleLogout} />;
      case 'user-management':
        // Double-check ở UI — dù menu đã ẩn, vẫn block nếu navigate trực tiếp
        if (!canManageUsers) {
          return (
            <Result
              status="403"
              title="Không có quyền truy cập"
              subTitle="Chức năng này chỉ dành cho Admin và Ban đào tạo."
              extra={<Button onClick={() => setActiveSlot('profile')}>Quay lại</Button>}
            />
          );
        }
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
              items={navItems}
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
