// AI-GENERATED
import React from 'react';
import { Form, Input, Select } from 'antd';
import type { FormInstance } from 'antd';
import type { RoleDto, UserDto, UserStatus } from '../../types';

interface UserFormProps {
  form: FormInstance;
  editingUser?: UserDto | null;
  roles: RoleDto[];
  onFinish: (values: any) => void;
}

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'ACTIVE',   label: 'Hoạt động' },
  { value: 'INACTIVE', label: 'Vô hiệu' },
  { value: 'LOCKED',   label: 'Khóa' },
];

const UserForm: React.FC<UserFormProps> = ({ form, editingUser, roles, onFinish }) => {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {!editingUser && (
        <>
          <Form.Item name="username" label="Tên đăng nhập"
            rules={[{ required: true, min: 3, message: 'Tối thiểu 3 ký tự' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu"
            rules={[{ required: true, min: 8, message: 'Tối thiểu 8 ký tự' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="roleId" label="Vai trò" rules={[{ required: true }]}>
            <Select options={roles.map((r) => ({ value: r.id, label: r.name }))} />
          </Form.Item>
        </>
      )}
      <Form.Item name="email" label="Email"
        rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="fullName" label="Họ tên">
        <Input />
      </Form.Item>
      {editingUser && (
        <Form.Item name="status" label="Trạng thái">
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
      )}
    </Form>
  );
};

export default UserForm;
