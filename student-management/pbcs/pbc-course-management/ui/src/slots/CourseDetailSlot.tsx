// AI-GENERATED
// Slot: course-detail — hiển thị chi tiết khóa học
import React, { useEffect, useState } from 'react';
import { Descriptions, Tag, Spin, Card, message } from 'antd';
import { getCourseById } from '../services/pbc-api';
import type { CourseDto, CourseStatus } from '../types';

const STATUS_COLOR: Record<CourseStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
  ARCHIVED: 'orange',
};

interface CourseDetailSlotProps {
  courseId?: string;
}

const CourseDetailSlot: React.FC<CourseDetailSlotProps> = ({ courseId }) => {
  const [course, setCourse] = useState<CourseDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    getCourseById(courseId)
      .then((res) => setCourse(res.data))
      .catch((err) => message.error((err as Error).message))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (!courseId) return <div style={{ padding: 24, color: '#999' }}>Chọn một khóa học để xem chi tiết.</div>;
  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;
  if (!course) return <div style={{ padding: 24 }}>Không tìm thấy khóa học.</div>;

  return (
    <Card style={{ margin: 24 }}>
      <Descriptions bordered column={2} title="Thông tin khóa học">
        <Descriptions.Item label="Mã khóa học">{course.courseCode}</Descriptions.Item>
        <Descriptions.Item label="Tên khóa học">{course.name}</Descriptions.Item>
        <Descriptions.Item label="Số tín chỉ">{course.credits}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={STATUS_COLOR[course.status]}>{course.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả" span={2}>{course.description ?? '—'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default CourseDetailSlot;
