// AI-GENERATED
import React, { useEffect, useState } from 'react';
import { Descriptions, Tag, Spin, message } from 'antd';
import type { Student } from '../types';
import { studentApi } from '../services/pbc-api';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'green', SUSPENDED: 'orange', GRADUATED: 'blue', DROPPED_OUT: 'red',
};

interface Props { studentId: string; }

export default function StudentDetailSlot({ studentId }: Props) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getById(studentId)
      .then(res => setStudent(res.data.data))
      .catch(() => message.error('Không thể tải thông tin sinh viên'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spin />;
  if (!student) return <div>Không tìm thấy sinh viên</div>;

  return (
    <Descriptions bordered column={2}>
      <Descriptions.Item label="Mã sinh viên">{student.studentCode}</Descriptions.Item>
      <Descriptions.Item label="Họ và tên">{student.fullName}</Descriptions.Item>
      <Descriptions.Item label="Email">{student.email}</Descriptions.Item>
      <Descriptions.Item label="Điện thoại">{student.phone}</Descriptions.Item>
      <Descriptions.Item label="Giới tính">{student.gender}</Descriptions.Item>
      <Descriptions.Item label="Ngày sinh">{student.dateOfBirth}</Descriptions.Item>
      <Descriptions.Item label="Trạng thái">
        <Tag color={STATUS_COLORS[student.status]}>{student.status}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Ngày nhập học">{student.enrollmentDate}</Descriptions.Item>
      <Descriptions.Item label="Địa chỉ" span={2}>{student.address}</Descriptions.Item>
    </Descriptions>
  );
}
