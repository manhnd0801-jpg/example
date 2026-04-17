// Standalone App — dùng khi chạy pbc-student-management UI độc lập (npm run dev)
// Khi deploy lên platform, App Shell thật sẽ load các slot qua Module Federation
import React, { useState } from 'react';
import { ConfigProvider, Layout, Menu, theme } from 'antd';
import { TeamOutlined, UserAddOutlined, ProfileOutlined, CheckCircleOutlined } from '@ant-design/icons';
import viVN from 'antd/locale/vi_VN';
import StudentListSlot from './slots/StudentListSlot';
import StudentFormSlot from './slots/StudentFormSlot';
import StudentDetailSlot from './slots/StudentDetailSlot';
import StudentStatusSlot from './slots/StudentStatusSlot';

const { Sider, Content } = Layout;

type ActiveSlot = 'list' | 'form' | 'detail' | 'status';

const StandaloneApp: React.FC = () => {
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>('list');

  const navItems = [
    { key: 'list',   icon: <TeamOutlined />,         label: 'Danh sách sinh viên' },
    { key: 'form',   icon: <UserAddOutlined />,       label: 'Thêm sinh viên' },
    { key: 'detail', icon: <ProfileOutlined />,       label: 'Chi tiết sinh viên' },
    { key: 'status', icon: <CheckCircleOutlined />,   label: 'Trạng thái' },
  ];

  const renderSlot = () => {
    switch (activeSlot) {
      case 'list':   return <StudentListSlot />;
      case 'form':   return <StudentFormSlot />;
      case 'detail': return <StudentDetailSlot />;
      case 'status': return <StudentStatusSlot />;
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
