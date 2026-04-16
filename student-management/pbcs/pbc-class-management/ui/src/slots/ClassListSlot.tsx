// AI-GENERATED
import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Progress, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const BASE = import.meta.env.VITE_CLASS_MGMT_URL || 'http://localhost:3003';

export default function ClassListSlot() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`${BASE}/v1/classes`, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
      .then(r => setClasses(r.data.data.classes || []))
      .catch(() => message.error('Không thể tải danh sách lớp'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: 'Mã lớp', dataIndex: 'classCode', key: 'classCode' },
    { title: 'Tên lớp', dataIndex: 'className', key: 'className' },
    { title: 'Năm học', dataIndex: 'academicYear', key: 'academicYear' },
    {
      title: 'Sĩ số', key: 'capacity',
      render: (_: any, r: any) => (
        <Space>
          <span>{r.currentStudents}/{r.maxStudents}</span>
          <Progress percent={Math.round((r.currentStudents / r.maxStudents) * 100)} size="small" style={{ width: 80 }} />
        </Space>
      ),
    },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'default'}>{s}</Tag> },
    { title: 'Thao tác', key: 'actions', render: () => <Space><Button size="small" type="link">Xem</Button><Button size="small" type="link">Sửa</Button></Space> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />}>Thêm lớp học</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={classes} loading={loading} />
    </div>
  );
}
