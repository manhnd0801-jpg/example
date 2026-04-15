// AI-GENERATED
import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import type { LoginRequestData } from '../../types';

interface LoginFormProps {
  loading?: boolean;
  error?: string | null;
  onSubmit: (values: LoginRequestData) => void;
  onErrorClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  loading = false,
  error,
  onSubmit,
  onErrorClose,
}) => {
  return (
    <>
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={onErrorClose}
          style={{ marginBottom: 16 }}
        />
      )}
      <Form layout="vertical" onFinish={onSubmit} autoComplete="off">
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default LoginForm;
