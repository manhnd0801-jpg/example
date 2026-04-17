// AI-GENERATED
// Slot: student-detail — hiển thị chi tiết sinh viên
import React, { useEffect, useState } from 'react';
import { Descriptions, Tag, Spin, Card, message } from 'antd';
import { getStudentById } from '../services/pbc-api';
import type { StudentDto, StudentStatus } from '../types';

const STATUS_COLOR: Record<StudentStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
  GRADUATED: 'blue',
  SUSPENDED: 'red',
};

interface StudentDetailSlotProps {
  studentId?: string;
}

const StudentDetailSlot: React.FC<StudentDetailSlotProps> = ({ studentId }) => {
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getStudentById(studentId)
      .then((res) => setStudent(res.data))
      .catch((err) => message.error((err as Error).message))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (!studentId) return <div style={{ padding: 24, color: '#999' }}>Chọn một sinh viên để xem chi tiết.</div>;
  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;
  if (!student) return <div style={{ padding: 24 }}>Không tìm thấy sinh viên.</div>;

  return (
    <Card style={{ margin: 24 }}>
      <Descriptions bordered column={2} title="Thông tin sinh viên">
        <Descriptions.Item label="Mã sinh viên">{student.studentCode}</Descriptions.Item>
        <Descriptions.Item label="Họ tên">{student.fullName}</Descriptions.Item>
        <Descriptions.Item label="Email">{student.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{student.phone ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">{student.dateOfBirth ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={STATUS_COLOR[student.status]}>{student.status}</Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default StudentDetailSlot;
