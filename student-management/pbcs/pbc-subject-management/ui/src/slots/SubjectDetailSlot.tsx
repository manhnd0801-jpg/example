// AI-GENERATED
import React, { useEffect, useState } from 'react';
import { Descriptions, Tag, Spin, message } from 'antd';
import axios from 'axios';

const BASE = import.meta.env.VITE_SUBJECT_MGMT_URL || 'http://localhost:3005';
const TYPE_COLORS: Record<string, string> = { REQUIRED: 'red', ELECTIVE: 'blue', FREE_ELECTIVE: 'green' };

export default function SubjectDetailSlot({ subjectId }: { subjectId: string }) {
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${BASE}/v1/subjects/${subjectId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } })
      .then(r => setSubject(r.data.data))
      .catch(() => message.error('Không thể tải thông tin môn học'))
      .finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) return <Spin />;
  if (!subject) return <div>Không tìm thấy môn học</div>;

  return (
    <Descriptions bordered column={2}>
      <Descriptions.Item label="Mã môn học">{subject.subjectCode}</Descriptions.Item>
      <Descriptions.Item label="Tên môn học">{subject.subjectName}</Descriptions.Item>
      <Descriptions.Item label="Tín chỉ LT">{subject.theoryCredits}</Descriptions.Item>
      <Descriptions.Item label="Tín chỉ TH">{subject.practiceCredits}</Descriptions.Item>
      <Descriptions.Item label="Tổng tín chỉ">{subject.totalCredits}</Descriptions.Item>
      <Descriptions.Item label="Loại"><Tag color={TYPE_COLORS[subject.subjectType]}>{subject.subjectType}</Tag></Descriptions.Item>
      <Descriptions.Item label="Mô tả" span={2}>{subject.description}</Descriptions.Item>
    </Descriptions>
  );
}
