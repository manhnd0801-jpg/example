// AI-GENERATED
import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const BASE = import.meta.env.VITE_SUBJECT_MGMT_URL || 'http://localhost:3005';
const TYPE_COLORS: Record<string, string> = { REQUIRED: 'red', ELECTIVE: 'blue', FREE_ELECTIVE: 'green' };

export default function SubjectListSlot() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [subjectType, setSubjectType] = useState<string | undefined>();

  const fetch = () => {
    setLoading(true);
    axios.get(`${BASE}/v1/subjects`, { params: { subjectType }, headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
      .then(r => setSubjects(r.data.data.subjects || []))
      .catch(() => message.error('Không thể tải danh sách môn học'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [subjectType]);

  const columns = [
    { title: 'Mã MH', dataIndex: 'subjectCode', key: 'subjectCode' },
    { title: 'Tên môn học', dataIndex: 'subjectName', key: 'subjectName' },
    { title: 'LT', dataIndex: 'theoryCredits', key: 'theoryCredits' },
    { title: 'TH', dataIndex: 'practiceCredits', key: 'practiceCredits' },
    { title: 'Tổng TC', dataIndex: 'totalCredits', key: 'totalCredits' },
    { title: 'Loại', dataIndex: 'subjectType', key: 'subjectType', render: (t: string) => <Tag color={TYPE_COLORS[t]}>{t}</Tag> },
    { title: 'Thao tác', key: 'actions', render: () => <Space><Button size="small" type="link">Xem</Button><Button size="small" type="link">Gán lớp</Button></Space> },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="Lọc loại môn học" allowClear style={{ width: 180 }} onChange={setSubjectType}
          options={[{ value: 'REQUIRED', label: 'Bắt buộc' }, { value: 'ELECTIVE', label: 'Tự chọn' }, { value: 'FREE_ELECTIVE', label: 'Tự chọn tự do' }]} />
        <Button type="primary" icon={<PlusOutlined />}>Thêm môn học</Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={subjects} loading={loading} />
    </div>
  );
}
