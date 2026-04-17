// AI-GENERATED
// Slot: class-detail — hiển thị chi tiết lớp học
import React, { useEffect, useState } from 'react';
import { Descriptions, Tag, Spin, Card, message } from 'antd';
import { getClassById } from '../services/pbc-api';
import type { ClassDto, ClassStatus } from '../types';

const STATUS_COLOR: Record<ClassStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
  COMPLETED: 'blue',
};

interface ClassDetailSlotProps {
  classId?: string;
}

const ClassDetailSlot: React.FC<ClassDetailSlotProps> = ({ classId }) => {
  const [cls, setCls] = useState<ClassDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    getClassById(classId)
      .then((res) => setCls(res.data))
      .catch((err) => message.error((err as Error).message))
      .finally(() => setLoading(false));
  }, [classId]);

  if (!classId) return <div style={{ padding: 24, color: '#999' }}>Chọn một lớp học để xem chi tiết.</div>;
  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;
  if (!cls) return <div style={{ padding: 24 }}>Không tìm thấy lớp học.</div>;

  return (
    <Card style={{ margin: 24 }}>
      <Descriptions bordered column={2} title="Thông tin lớp học">
        <Descriptions.Item label="Mã lớp">{cls.classCode}</Descriptions.Item>
        <Descriptions.Item label="Tên lớp">{cls.name}</Descriptions.Item>
        <Descriptions.Item label="Sĩ số">{cls.currentStudents}/{cls.maxStudents}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={STATUS_COLOR[cls.status]}>{cls.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">{cls.startDate ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Ngày kết thúc">{cls.endDate ?? '—'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default ClassDetailSlot;
