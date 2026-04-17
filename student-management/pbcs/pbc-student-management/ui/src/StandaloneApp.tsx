// AI-GENERATED
import React from 'react';
import { ConfigProvider, Layout, Menu, Typography } from 'antd';
import StudentListSlot from './slots/StudentListSlot';

const { Header, Content } = Layout;

export default function StandaloneApp() {
  return (
    <ConfigProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
            Student Management (Dev Mode)
          </Typography.Title>
        </Header>
        <Content style={{ padding: 24 }}>
          <StudentListSlot />
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
