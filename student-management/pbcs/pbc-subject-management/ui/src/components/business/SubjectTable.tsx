// AI-GENERATED
import React from 'react';
import { Table, Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { SubjectDto, SubjectStatus } from '../../types';

const STATUS_COLOR: Record<SubjectStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
};

const STATUS_LABEL: Record<SubjectStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Vô hiệu',
};

interface SubjectTableProps {
  subjects: SubjectDto[];
  total: number;
  page: number;
  pageSize?: number;
  loading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit: (subject: SubjectDto) => void;
  onDelete: (subjectId: string) => void;
  onPageChange: (page: number) => void;
}

const SubjectTable: React.FC<SubjectTableProps> = ({
  subjects, total, page, pageSize = 20,
  loading, canEdit = true, canDelete = true,
  onEdit, onDelete, onPageChange,
}) => {
  const columns: ColumnsType<SubjectDto> = [
    { title: 'Mã môn học', dataIndex: 'subjectCode', key: 'subjectCode' },
    { title: 'Tên môn học', dataIndex: 'name', key: 'name' },
    { title: 'Số tín chỉ', dataIndex: 'credits', key: 'credits' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status: SubjectStatus) => (
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
              title="Xác nhận xóa môn học này?"
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
      dataSource={subjects}
      rowKey="id"
      loading={loading}
      pagination={{ total, pageSize, current: page, onChange: onPageChange }}
    />
  );
};

export default SubjectTable;
