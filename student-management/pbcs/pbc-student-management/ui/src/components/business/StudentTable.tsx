// AI-GENERATED
import React from 'react';
import { Table, Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { StudentDto, StudentStatus } from '../../types';

const STATUS_COLOR: Record<StudentStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
  GRADUATED: 'blue',
  SUSPENDED: 'red',
};

const STATUS_LABEL: Record<StudentStatus, string> = {
  ACTIVE: 'Đang học',
  INACTIVE: 'Vô hiệu',
  GRADUATED: 'Đã tốt nghiệp',
  SUSPENDED: 'Đình chỉ',
};

interface StudentTableProps {
  students: StudentDto[];
  total: number;
  page: number;
  pageSize?: number;
  loading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit: (student: StudentDto) => void;
  onDelete: (studentId: string) => void;
  onPageChange: (page: number) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students, total, page, pageSize = 20,
  loading, canEdit = true, canDelete = true,
  onEdit, onDelete, onPageChange,
}) => {
  const columns: ColumnsType<StudentDto> = [
    { title: 'Mã SV', dataIndex: 'studentCode', key: 'studentCode' },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone',
      render: (v) => v ?? '—' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status: StudentStatus) => (
        <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>
      ),
    },
    {
      title: 'Thao tác', key: 'actions',
      render: (_, record) => (
        <Space>
          {canEdit && (
            <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)}>
              Sửa
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="Xác nhận xóa sinh viên này?"
              onConfirm={() => onDelete(record.id)}
              okText="Xóa" cancelText="Hủy"
            >
              <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={students}
      rowKey="id"
      loading={loading}
      pagination={{ total, pageSize, current: page, onChange: onPageChange }}
    />
  );
};

export default StudentTable;
