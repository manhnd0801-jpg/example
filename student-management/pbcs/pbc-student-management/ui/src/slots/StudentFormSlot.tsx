// AI-GENERATED
// Slot: student-form — thin wrapper, dùng khi App Shell mount form độc lập
import React, { useState } from 'react';
import { message } from 'antd';
import StudentForm from '../components/business/StudentForm';
import { createStudent, updateStudent } from '../services/pbc-api';
import { emitStudentEvent } from '../hooks/event-handlers';
import type { CreateStudentData, UpdateStudentData } from '../types';

interface StudentFormSlotProps {
  studentId?: string;
  onSuccess?: () => void;
}

const StudentFormSlot: React.FC<StudentFormSlotProps> = ({ studentId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!studentId;

  const handleSubmit = async (data: CreateStudentData | UpdateStudentData) => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateStudent(studentId!, data as UpdateStudentData);
        message.success('Cập nhật sinh viên thành công');
        emitStudentEvent('student.updated', { studentId, ...data });
      } else {
        await createStudent(data as CreateStudentData);
        message.success('Thêm sinh viên thành công');
        emitStudentEvent('student.created', data as Record<string, unknown>);
      }
      onSuccess?.();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentForm
      loading={loading}
      onSubmit={handleSubmit}
      onCancel={() => onSuccess?.()}
    />
  );
};

export default StudentFormSlot;
