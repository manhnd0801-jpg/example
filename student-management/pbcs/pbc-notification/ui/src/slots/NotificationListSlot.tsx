// AI-GENERATED
import React, { useEffect, useState } from 'react';
import { List, Tag, Button, Space, Select, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import axios from 'axios';

const BASE = import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:3006';

export default function NotificationListSlot() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRead, setIsRead] = useState<string | undefined>();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const headers = { Authorization: `Bearer ${localStorage.getItem('access_token')}` };

  const fetch = () => {
    setLoading(true);
    axios.get(`${BASE}/v1/notifications`, { params: { page, pageSize: 20, isRead }, headers })
      .then(r => { setNotifications(r.data.data.notifications || []); setTotal(r.data.data.pagination?.total || 0); })
      .catch(() => message.error('Không thể tải thông báo'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page, isRead]);

  const markRead = async (id: string) => {
    await axios.patch(`${BASE}/v1/notifications/${id}/read`, {}, { headers });
    fetch();
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="Lọc trạng thái" allowClear style={{ width: 160 }} onChange={setIsRead}
          options={[{ value: 'false', label: 'Chưa đọc' }, { value: 'true', label: 'Đã đọc' }]} />
        <Button onClick={() => axios.patch(`${BASE}/v1/notifications/read-all`, {}, { headers }).then(fetch)}>Đọc tất cả</Button>
      </Space>
      <List
        loading={loading}
        dataSource={notifications}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
        renderItem={(item: any) => (
          <List.Item
            style={{ background: item.isRead ? 'transparent' : '#f0f7ff', borderRadius: 6, marginBottom: 4, padding: '12px 16px' }}
            actions={[!item.isRead && <Button size="small" icon={<CheckOutlined />} onClick={() => markRead(item.id)}>Đọc</Button>].filter(Boolean)}
          >
            <List.Item.Meta
              title={<Space>{item.title}<Tag color={item.isRead ? 'default' : 'blue'}>{item.isRead ? 'Đã đọc' : 'Mới'}</Tag></Space>}
              description={item.content}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
