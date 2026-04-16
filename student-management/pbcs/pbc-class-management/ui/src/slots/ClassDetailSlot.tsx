// AI-GENERATED
import React, { useEffect, useState } from 'react';
import { Descriptions, Table, Tag, Spin, Progress, message } from 'antd';
import axios from 'axios';

const BASE = import.meta.env.VITE_CLASS_MGMT_URL || 'http://localhost:3003';

export default function ClassDetailSlot({ classId }: { classId: string }) {
  const [cls, setCls] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${localStorage.getItem('access_token')}` };

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE}/v1/classes/${classId}`, { headers }),
      axios.get(`${BASE}/v1/classes/${classId}/students`, { headers }),
    ])
      .then(([c, s]) => { setCls(c.data.data); setStudents(s.data.data.students || []); })
      .catch(() => message.error('Không thể tải thông tin lớp'))
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <Spin />;
  if (!cls) return <div>Không tìm thấy lớp học</div>;

  return (
    <div>
      <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Mã lớp">{cls.classCode}</Descriptions.Item>
        <Descriptions.Item label="Tên lớp">{cls.className}</Descriptions.Item>
        <Descriptions.Item label="Năm học">{cls.academicYear}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái"><Tag color="green">{cls.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="Sĩ số">
          {cls.currentStudents}/{cls.maxStudents} <Progress percent={Math.round((cls.currentStudents / cls.maxStudents) * 100)} size="small" style={{ width: 100, display: 'inline-block', marginLeft: 8 }} />
        </Descriptions.Item>
      </Descriptions>
      <Table rowKey="id" dataSource={students} columns={[
        { title: 'Student ID', dataIndex: 'studentId', key: 'studentId' },
        { title: 'Ngày gán', dataIndex: 'assignedDate', key: 'assignedDate' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s: string) => <Tag>{s}</Tag> },
      ]} />
    </div>
  );
}
