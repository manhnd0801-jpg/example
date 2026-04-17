// Standalone App — dùng khi chạy pbc-notification UI độc lập (npm run dev)
// Khi deploy lên platform, App Shell thật sẽ load các slot qua Module Federation
import React, { useState } from 'react';
import { ConfigProvider, Layout, Menu, theme } from 'antd';
import { BellOutlined, UnorderedListOutlined, AuditOutlined } from '@ant-design/icons';
import viVN from 'antd/locale/vi_VN';
import NotificationBellSlot from './slots/NotificationBellSlot';
import NotificationListSlot from './slots/NotificationListSlot';
import AuditLogSlot from './slots/AuditLogSlot';

const { Sider, Content } = Layout;

type ActiveSlot = 'bell' | 'list' | 'audit';

const StandaloneApp: React.FC = () => {
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>('list');

  const navItems = [
    { key: 'bell',  icon: <BellOutlined />,          label: 'Chuông thông báo' },
    { key: 'list',  icon: <UnorderedListOutlined />,  label: 'Danh sách thông báo' },
    { key: 'audit', icon: <AuditOutlined />,          label: 'Nhật ký hệ thống' },
  ];

  const renderSlot = () => {
    switch (activeSlot) {
      case 'bell':  return <NotificationBellSlot />;
      case 'list':  return <NotificationListSlot />;
      case 'audit': return <AuditLogSlot />;
      default:      return null;
    }
  };

  return (
    <ConfigProvider locale={viVN} theme={{ algorithm: theme.defaultAlgorithm }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={220} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[activeSlot]}
            items={navItems}
            onClick={({ key }) => setActiveSlot(key as ActiveSlot)}
            style={{ height: '100%', borderRight: 0, paddingTop: 8 }}
          />
        </Sider>
        <Content style={{ background: '#f5f5f5', minHeight: '100vh' }}>
          {renderSlot()}
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default StandaloneApp;
