// AI-GENERATED
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, Layout, Typography } from 'antd';
import ClassListSlot from './slots/ClassListSlot';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Header><Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>Class Management (Dev)</Typography.Title></Layout.Header>
        <Layout.Content style={{ padding: 24 }}><ClassListSlot /></Layout.Content>
      </Layout>
    </ConfigProvider>
  </React.StrictMode>,
);