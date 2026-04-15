// AI-GENERATED
// Slot: profile — thin wrapper, orchestrate ChangePasswordForm
import React, { useState } from 'react';
import { Card, Typography, Divider, Descriptions, Button, Form, Input, message } from 'antd';
import { changePassword, logout } from '../services/pbc-api';
import { emitAuthEvent } from '../hooks/event-handlers';
import type { UserDto } from '../types';

const { Title } = Typography;

interface ProfileSlotProps {
  currentUser?: UserDto;
  onLogout?: () => void;
}

const ProfileSlot: React.FC<ProfileSlotProps> = ({ currentUser, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      message.success('Đổi mật khẩu thành công');
      form.resetFields();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken') ?? '';
    try {
      await logout(refreshToken);
    } finally {
      // Phát event lên App Shell → forward lên Kafka
      if (currentUser) {
        emitAuthEvent('pbc.auth.user.logged-out', { userId: currentUser.id });
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      onLogout?.();
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <Card>
        <Title level={4}>Thông tin cá nhân</Title>

        {currentUser && (
          <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Tên đăng nhập">{currentUser.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{currentUser.email}</Descriptions.Item>
            <Descriptions.Item label="Họ tên">{currentUser.fullName ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Vai trò">{currentUser.role}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{currentUser.status}</Descriptions.Item>
          </Descriptions>
        )}

        <Divider />

        <Title level={5}>Đổi mật khẩu</Title>
        <Form form={form} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item name="currentPassword" label="Mật khẩu hiện tại"
            rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới"
            rules={[{ required: true, min: 8, message: 'Tối thiểu 8 ký tự' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Xác nhận mật khẩu mới"
            rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>

        <Divider />
        <Button danger onClick={handleLogout}>Đăng xuất</Button>
      </Card>
    </div>
  );
};

export default ProfileSlot;
