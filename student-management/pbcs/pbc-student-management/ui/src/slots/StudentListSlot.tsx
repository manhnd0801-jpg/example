// AI-GENERATED
import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Input, Select, message } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import type { Student } from '../types';
import { studentApi } from '../services/pbc-api';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'green', SUSPENDED: 'orange', GRADUATED: 'blue', DROPPED_OUT: 'red',
};

export default function StudentListSlot() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentApi.list({ page, pageSize: 20, search, status });
      setStudents(res.data.data.students);
      setTotal(res.data.data.pagination.total);
    } catch {
      message.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [page, search, status]);

  const columns = [
    { title: 'Mã SV', dataIndex: 'studentCode', key: 'studentCode' },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Điện thoại', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={STATUS_COLORS[s]}>{s}</Tag>,
    },
    {
      title: 'Thao tác', key: 'actions',
      render: (_: unknown, record: Student) => (
        <Space>
          <Button size="small" type="link">Xem</Button>
          <Button size="small" type="link">Sửa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Tìm theo tên hoặc mã SV"
          onSearch={setSearch}
          style={{ width: 280 }}
          allowClear
        />
        <Select
          placeholder="Lọc trạng thái"
          allowClear
          style={{ width: 160 }}
          onChange={setStatus}
          options={[
            { value: 'ACTIVE', label: 'Đang học' },
            { value: 'SUSPENDED', label: 'Tạm dừng' },
            { value: 'GRADUATED', label: 'Tốt nghiệp' },
            { value: 'DROPPED_OUT', label: 'Thôi học' },
          ]}
        />
        <Button type="primary" icon={<PlusOutlined />}>Thêm sinh viên</Button>
        <Button icon={<DownloadOutlined />}>Xuất Excel</Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={students}
        loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
      />
    </div>
  );
}
