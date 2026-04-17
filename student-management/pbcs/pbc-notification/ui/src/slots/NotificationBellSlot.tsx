// AI-GENERATED
// Slot: notification-bell — badge + popover hiển thị thông báo chưa đọc
import React, { useEffect, useState } from 'react';
import { Badge, Button, Popover, List, Typography, Empty, message } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { listNotifications, markAsRead, getUnreadCount } from '../services/pbc-api';
import { emitNotificationEvent } from '../hooks/event-handlers';
import type { NotificationDto } from '../types';

const { Text } = Typography;

const NotificationBellSlot: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        listNotifications({ pageSize: 5, status: 'UNREAD' }),
        getUnreadCount(),
      ]);
      setNotifications(listRes.data.items);
      setUnreadCount(countRes.data.count);
    } catch {
      // Bell không nên crash app nếu notification service down
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
      emitNotificationEvent('notification.read', { notificationId: id });
      fetchData();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const content = (
    <div style={{ width: 320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text strong>Thông báo</Text>
      </div>
      {notifications.length === 0 ? (
        <Empty description="Không có thông báo mới" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          size="small"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{ background: '#f0f7ff', borderRadius: 4, padding: '8px 12px', marginBottom: 4 }}
              actions={[
                <Button key="read" size="small" type="link" onClick={() => handleMarkRead(item.id)}>
                  Đã đọc
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{item.title}</Text>}
                description={<Text type="secondary" style={{ fontSize: 12 }}>{item.message}</Text>}
              />
            </List.Item>
          )}
        />
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
};

export default NotificationBellSlot;
