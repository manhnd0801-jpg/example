// AI-GENERATED
// Slot: course-form — thin wrapper, dùng khi App Shell mount form độc lập
import React, { useState } from 'react';
import { message } from 'antd';
import CourseForm from '../components/business/CourseForm';
import { createCourse } from '../services/pbc-api';
import { emitCourseEvent } from '../hooks/event-handlers';
import type { CreateCourseData } from '../types';

interface CourseFormSlotProps {
  onSuccess?: () => void;
}

const CourseFormSlot: React.FC<CourseFormSlotProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateCourseData) => {
    setLoading(true);
    try {
      await createCourse(data);
      message.success('Tạo khóa học thành công');
      emitCourseEvent('course.created', data as Record<string, unknown>);
      onSuccess?.();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CourseForm
      loading={loading}
      onSubmit={handleSubmit}
      onCancel={() => onSuccess?.()}
    />
  );
};

export default CourseFormSlot;
