// Standalone App — dùng khi chạy pbc-class-management UI độc lập (npm run dev)
// Khi deploy lên platform, App Shell thật sẽ load các slot qua Module Federation
import React, { useState } from 'react';
import { ConfigProvider, Layout, Menu, theme } from 'antd';
import { BookOutlined, PlusOutlined, ProfileOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import viVN from 'antd/locale/vi_VN';
import ClassListSlot from './slots/ClassListSlot';
import ClassFormSlot from './slots/ClassFormSlot';
import ClassDetailSlot from './slots/ClassDetailSlot';
import ClassAssignSlot from './slots/ClassAssignSlot';

const { Sider, Content } = Layout;

type ActiveSlot = 'list' | 'form' | 'detail' | 'assign';

const StandaloneApp: React.FC = () => {
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>('list');

  const navItems = [
    { key: 'list',   icon: <BookOutlined />,          label: 'Danh sách lớp học' },
    { key: 'form',   icon: <PlusOutlined />,           label: 'Tạo lớp học' },
    { key: 'detail', icon: <ProfileOutlined />,        label: 'Chi tiết lớp học' },
    { key: 'assign', icon: <UsergroupAddOutlined />,   label: 'Phân công giảng viên' },
  ];

  const renderSlot = () => {
    switch (activeSlot) {
      case 'list':   return <ClassListSlot />;
      case 'form':   return <ClassFormSlot />;
      case 'detail': return <ClassDetailSlot />;
      case 'assign': return <ClassAssignSlot />;
      default:       return null;
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
