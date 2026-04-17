// AI-GENERATED
// Slot: subject-detail — hiển thị chi tiết môn học
import React, { useEffect, useState } from 'react';
import { Descriptions, Tag, Spin, Card, message } from 'antd';
import { getSubjectById } from '../services/pbc-api';
import type { SubjectDto, SubjectStatus } from '../types';

const STATUS_COLOR: Record<SubjectStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
};

interface SubjectDetailSlotProps {
  subjectId?: string;
}

const SubjectDetailSlot: React.FC<SubjectDetailSlotProps> = ({ subjectId }) => {
  const [subject, setSubject] = useState<SubjectDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    getSubjectById(subjectId)
      .then((res) => setSubject(res.data))
      .catch((err) => message.error((err as Error).message))
      .finally(() => setLoading(false));
  }, [subjectId]);

  if (!subjectId) return <div style={{ padding: 24, color: '#999' }}>Chọn một môn học để xem chi tiết.</div>;
  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;
  if (!subject) return <div style={{ padding: 24 }}>Không tìm thấy môn học.</div>;

  return (
    <Card style={{ margin: 24 }}>
      <Descriptions bordered column={2} title="Thông tin môn học">
        <Descriptions.Item label="Mã môn học">{subject.subjectCode}</Descriptions.Item>
        <Descriptions.Item label="Tên môn học">{subject.name}</Descriptions.Item>
        <Descriptions.Item label="Số tín chỉ">{subject.credits}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={STATUS_COLOR[subject.status]}>{subject.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả" span={2}>{subject.description ?? '—'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default SubjectDetailSlot;
