// Standalone App — dùng khi chạy pbc-course-management UI độc lập (npm run dev)
// Khi deploy lên platform, App Shell thật sẽ load các slot qua Module Federation
import React, { useState } from 'react';
import { ConfigProvider, Layout, Menu, theme } from 'antd';
import { ReadOutlined, PlusOutlined, ProfileOutlined } from '@ant-design/icons';
import viVN from 'antd/locale/vi_VN';
import CourseListSlot from './slots/CourseListSlot';
import CourseFormSlot from './slots/CourseFormSlot';
import CourseDetailSlot from './slots/CourseDetailSlot';

const { Sider, Content } = Layout;

type ActiveSlot = 'list' | 'form' | 'detail';

const StandaloneApp: React.FC = () => {
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>('list');

  const navItems = [
    { key: 'list',   icon: <ReadOutlined />,    label: 'Danh sách khóa học' },
    { key: 'form',   icon: <PlusOutlined />,    label: 'Tạo khóa học' },
    { key: 'detail', icon: <ProfileOutlined />, label: 'Chi tiết khóa học' },
  ];

  const renderSlot = () => {
    switch (activeSlot) {
      case 'list':   return <CourseListSlot />;
      case 'form':   return <CourseFormSlot />;
      case 'detail': return <CourseDetailSlot />;
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
