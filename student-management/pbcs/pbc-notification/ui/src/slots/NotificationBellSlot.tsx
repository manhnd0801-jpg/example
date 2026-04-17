// AI-GENERATED
import React, { useEffect, useState } from 'react';
import { Badge, Button, Popover, List, Typography, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import axios from 'axios';

const BASE = import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:3006';

export default function NotificationBellSlot() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = () => {
    axios.get(`${BASE}/v1/notifications`, { params: { pageSize: 5, isRead: false }, headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } })
      .then(r => {
        setNotifications(r.data.data.notifications || []);
        setUnreadCount(r.data.data.unreadCount || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    await axios.patch(`${BASE}/v1/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
    fetchNotifications();
  };

  const content = (
    <div style={{ width: 320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Typography.Text strong>Thông báo</Typography.Text>
        {unreadCount > 0 && <Button size="small" type="link" onClick={markAllRead}>Đọc tất cả</Button>}
      </div>
      {notifications.length === 0 ? (
        <Empty description="Không có thông báo mới" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List size="small" dataSource={notifications} renderItem={(item: any) => (
          <List.Item style={{ background: item.isRead ? 'transparent' : '#f0f7ff', borderRadius: 4, padding: '8px 12px', marginBottom: 4 }}>
            <List.Item.Meta
              title={<Typography.Text strong={!item.isRead}>{item.title}</Typography.Text>}
              description={<Typography.Text type="secondary" style={{ fontSize: 12 }}>{item.content}</Typography.Text>}
            />
          </List.Item>
        )} />
      )}
    </div>
  );

  return (
    <Popover content={content} trigger="click" open={open} onOpenChange={setOpen} placement="bottomRight">
      <Badge count={unreadCount} size="small">
        <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
      </Badge>
    </Popover>
  );
}
