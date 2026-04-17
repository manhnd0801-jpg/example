// AI-GENERATED
import React, { useEffect, useState } from 'react';
import { Descriptions, Table, Tag, Spin, message } from 'antd';
import axios from 'axios';

const BASE = import.meta.env.VITE_COURSE_MGMT_URL || 'http://localhost:3004';

export default function CourseDetailSlot({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE}/v1/courses/${courseId}`, { headers }),
      axios.get(`${BASE}/v1/courses/${courseId}/subjects`, { headers }),
    ])
      .then(([c, s]) => { setCourse(c.data.data); setSubjects(s.data.data.subjects || []); })
      .catch(() => message.error('Không thể tải thông tin chương trình'))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <Spin />;
  if (!course) return <div>Không tìm thấy chương trình</div>;

  return (
    <div>
      <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Mã CT">{course.courseCode}</Descriptions.Item>
        <Descriptions.Item label="Tên CT">{course.courseName}</Descriptions.Item>
        <Descriptions.Item label="Số năm">{course.durationYears} năm</Descriptions.Item>
        <Descriptions.Item label="Tổng tín chỉ">{course.totalCredits}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái"><Tag color="green">{course.status}</Tag></Descriptions.Item>
      </Descriptions>
      <Table rowKey="id" dataSource={subjects} columns={[
        { title: 'Subject ID', dataIndex: 'subjectId', key: 'subjectId' },
        { title: 'Học kỳ', dataIndex: 'semester', key: 'semester' },
        { title: 'Bắt buộc', dataIndex: 'isRequired', key: 'isRequired', render: (v: boolean) => <Tag color={v ? 'red' : 'blue'}>{v ? 'Bắt buộc' : 'Tự chọn'}</Tag> },
      ]} />
    </div>
  );
}
