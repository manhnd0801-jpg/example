// AI-GENERATED
import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Select, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import CourseFormSlot from './CourseFormSlot';

const BASE = import.meta.env.VITE_COURSE_MGMT_URL || 'http://localhost:3004';

export default function CourseListSlot() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | undefined>();
  const [showForm, setShowForm] = useState(false);

  const fetchCourses = () => {
    setLoading(true);
    axios.get(`${BASE}/v1/courses`, { params: { status }, headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } })
      .then(r => setCourses(r.data.data.courses || []))
      .catch(() => message.error('Không thể tải danh sách chương trình'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, [status]);

  const columns = [
    { title: 'Mã CT', dataIndex: 'courseCode', key: 'courseCode' },
    { title: 'Tên chương trình', dataIndex: 'courseName', key: 'courseName' },
    { title: 'Số năm', dataIndex: 'durationYears', key: 'durationYears', render: (v: number) => `${v} năm` },
    { title: 'Tổng tín chỉ', dataIndex: 'totalCredits', key: 'totalCredits' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : s === 'UPCOMING' ? 'blue' : 'default'}>{s}</Tag> },
    { title: 'Thao tác', key: 'actions', render: () => <Space><Button size="small" type="link">Xem</Button><Button size="small" type="link">Sửa</Button></Space> },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="Lọc trạng thái" allowClear style={{ width: 160 }} onChange={setStatus}
          options={[{ value: 'ACTIVE', label: 'Đang hoạt động' }, { value: 'UPCOMING', label: 'Sắp mở' }, { value: 'CLOSED', label: 'Đã đóng' }]} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>Thêm chương trình</Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={courses} loading={loading} />
      <Modal title="Thêm chương trình" open={showForm} onCancel={() => setShowForm(false)} footer={null} destroyOnClose>
        <CourseFormSlot onSuccess={() => { setShowForm(false); fetchCourses(); }} />
      </Modal>
    </div>
  );
}
