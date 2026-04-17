// AI-GENERATED
// Slot: notification-list — danh sách thông báo với filter và phân trang
import React, { useEffect, useState } from 'react';
import { Select, Space, message } from 'antd';
import NotificationList from '../components/business/NotificationList';
import { listNotifications, markAsRead, dismissNotification } from '../services/pbc-api';
import { emitNotificationEvent } from '../hooks/event-handlers';
import type { NotificationDto, NotificationStatus } from '../types';

const NotificationListSlot: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<NotificationStatus | undefined>();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await listNotifications({ pageSize: 20, status });
      setNotifications(res.data.items);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [status]);

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
      emitNotificationEvent('notification.read', { notificationId: id });
      fetchNotifications();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissNotification(id);
      emitNotificationEvent('notification.dismissed', { notificationId: id });
      fetchNotifications();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Lọc trạng thái"
          allowClear
          style={{ width: 160 }}
          onChange={(v) => setStatus(v as NotificationStatus | undefined)}
          options={[
            { value: 'UNREAD', label: 'Chưa đọc' },
            { value: 'READ', label: 'Đã đọc' },
            { value: 'DISMISSED', label: 'Đã ẩn' },
          ]}
        />
      </Space>
      <NotificationList
        notifications={notifications}
        loading={loading}
        onMarkRead={handleMarkRead}
        onDismiss={handleDismiss}
      />
    </div>
  );
};

export default NotificationListSlot;
