// AI-GENERATED
import React from 'react';
import { Table, Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ClassDto, ClassStatus } from '../../types';

const STATUS_COLOR: Record<ClassStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
  COMPLETED: 'blue',
};

const STATUS_LABEL: Record<ClassStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Vô hiệu',
  COMPLETED: 'Đã kết thúc',
};

interface ClassTableProps {
  classes: ClassDto[];
  total: number;
  page: number;
  pageSize?: number;
  loading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit: (cls: ClassDto) => void;
  onDelete: (classId: string) => void;
  onAssign: (cls: ClassDto) => void;
  onPageChange: (page: number) => void;
}

const ClassTable: React.FC<ClassTableProps> = ({
  classes, total, page, pageSize = 20,
  loading, canEdit = true, canDelete = true,
  onEdit, onDelete, onAssign, onPageChange,
}) => {
  const columns: ColumnsType<ClassDto> = [
    { title: 'Mã lớp', dataIndex: 'classCode', key: 'classCode' },
    { title: 'Tên lớp', dataIndex: 'name', key: 'name' },
    { title: 'Sĩ số', key: 'students',
      render: (_, r) => `${r.currentStudents}/${r.maxStudents}` },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status: ClassStatus) => (
        <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>
      ),
    },
    {
      title: 'Thao tác', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<UserAddOutlined />} size="small" onClick={() => onAssign(record)}>
            Phân công
          </Button>
          {canEdit && (
            <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)}>
              Sửa
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="Xác nhận xóa lớp học này?"
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
      dataSource={classes}
      rowKey="id"
      loading={loading}
      pagination={{ total, pageSize, current: page, onChange: onPageChange }}
    />
  );
};

export default ClassTable;
