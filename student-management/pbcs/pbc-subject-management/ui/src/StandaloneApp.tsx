// Standalone App — dùng khi chạy pbc-subject-management UI độc lập (npm run dev)
// Khi deploy lên platform, App Shell thật sẽ load các slot qua Module Federation
import React, { useState } from 'react';
import { ConfigProvider, Layout, Menu, theme } from 'antd';
import { FileTextOutlined, PlusOutlined, ProfileOutlined, LinkOutlined } from '@ant-design/icons';
import viVN from 'antd/locale/vi_VN';
import SubjectListSlot from './slots/SubjectListSlot';
import SubjectFormSlot from './slots/SubjectFormSlot';
import SubjectDetailSlot from './slots/SubjectDetailSlot';
import SubjectAssignSlot from './slots/SubjectAssignSlot';

const { Sider, Content } = Layout;

type ActiveSlot = 'list' | 'form' | 'detail' | 'assign';

const StandaloneApp: React.FC = () => {
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>('list');

  const navItems = [
    { key: 'list',   icon: <FileTextOutlined />, label: 'Danh sách môn học' },
    { key: 'form',   icon: <PlusOutlined />,     label: 'Tạo môn học' },
    { key: 'detail', icon: <ProfileOutlined />,  label: 'Chi tiết môn học' },
    { key: 'assign', icon: <LinkOutlined />,     label: 'Gán môn học' },
  ];

  const renderSlot = () => {
    switch (activeSlot) {
      case 'list':   return <SubjectListSlot />;
      case 'form':   return <SubjectFormSlot />;
      case 'detail': return <SubjectDetailSlot />;
      case 'assign': return <SubjectAssignSlot />;
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
