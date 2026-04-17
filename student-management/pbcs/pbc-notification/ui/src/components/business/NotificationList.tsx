// AI-GENERATED
import React from 'react';
import { List, Tag, Button, Space, Empty } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { NotificationDto, NotificationType, NotificationStatus } from '../../types';

const TYPE_COLOR: Record<NotificationType, string> = {
  info: 'blue',
  warning: 'orange',
  error: 'red',
  success: 'green',
};

const STATUS_LABEL: Record<NotificationStatus, string> = {
  UNREAD: 'Chưa đọc',
  READ: 'Đã đọc',
  DISMISSED: 'Đã ẩn',
};

interface NotificationListProps {
  notifications: NotificationDto[];
  loading?: boolean;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications, loading, onMarkRead, onDismiss,
}) => {
  if (!loading && notifications.length === 0) {
    return <Empty description="Không có thông báo mới" />;
  }

  return (
    <List
      loading={loading}
      dataSource={notifications}
      renderItem={(item) => (
        <List.Item
          actions={[
            item.status === 'UNREAD' && (
              <Button
                key="read"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => onMarkRead(item.id)}
              >
                Đã đọc
              </Button>
            ),
            item.status !== 'DISMISSED' && (
              <Button
                key="dismiss"
                icon={<CloseOutlined />}
                size="small"
                onClick={() => onDismiss(item.id)}
              >
                Ẩn
              </Button>
            ),
          ].filter(Boolean)}
        >
          <List.Item.Meta
            title={
              <Space>
                <Tag color={TYPE_COLOR[item.type]}>{item.type.toUpperCase()}</Tag>
                <span>{item.title}</span>
                {item.status === 'UNREAD' && <Tag color="red">Mới</Tag>}
              </Space>
            }
            description={item.message}
          />
        </List.Item>
      )}
    />
  );
};

export default NotificationList;
