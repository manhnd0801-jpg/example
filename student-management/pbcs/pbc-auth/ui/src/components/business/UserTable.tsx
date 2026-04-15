// AI-GENERATED
import React from 'react';
import { Table, Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UserDto, UserStatus } from '../../types';

const STATUS_COLOR: Record<UserStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
  LOCKED: 'red',
};

const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Vô hiệu',
  LOCKED: 'Khóa',
};

interface UserTableProps {
  users: UserDto[];
  total: number;
  page: number;
  pageSize?: number;
  loading?: boolean;
  onEdit: (user: UserDto) => void;
  onDelete: (userId: string) => void;
  onPageChange: (page: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users, total, page, pageSize = 20,
  loading, onEdit, onDelete, onPageChange,
}) => {
  const columns: ColumnsType<UserDto> = [
    { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', render: (v) => v ?? '—' },
    {
      title: 'Vai trò', dataIndex: 'role', key: 'role',
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status: UserStatus) => (
        <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>
      ),
    },
    {
      title: 'Thao tác', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa người dùng này?"
            onConfirm={() => onDelete(record.id)}
            okText="Xóa" cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={loading}
      pagination={{ total, pageSize, current: page, onChange: onPageChange }}
    />
  );
};

export default UserTable;
