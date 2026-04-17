// AI-GENERATED
import React from 'react';
import { Table, Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { CourseDto, CourseStatus } from '../../types';

const STATUS_COLOR: Record<CourseStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
  ARCHIVED: 'orange',
};

const STATUS_LABEL: Record<CourseStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Vô hiệu',
  ARCHIVED: 'Lưu trữ',
};

interface CourseTableProps {
  courses: CourseDto[];
  total: number;
  page: number;
  pageSize?: number;
  loading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit: (course: CourseDto) => void;
  onDelete: (courseId: string) => void;
  onPageChange: (page: number) => void;
}

const CourseTable: React.FC<CourseTableProps> = ({
  courses, total, page, pageSize = 20,
  loading, canEdit = true, canDelete = true,
  onEdit, onDelete, onPageChange,
}) => {
  const columns: ColumnsType<CourseDto> = [
    { title: 'Mã khóa học', dataIndex: 'courseCode', key: 'courseCode' },
    { title: 'Tên khóa học', dataIndex: 'name', key: 'name' },
    { title: 'Số tín chỉ', dataIndex: 'credits', key: 'credits' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status: CourseStatus) => (
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
              title="Xác nhận xóa khóa học này?"
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
      dataSource={courses}
      rowKey="id"
      loading={loading}
      pagination={{ total, pageSize, current: page, onChange: onPageChange }}
    />
  );
};

export default CourseTable;
