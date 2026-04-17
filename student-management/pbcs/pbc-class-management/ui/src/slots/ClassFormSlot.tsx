// AI-GENERATED
// Slot: class-form — thin wrapper, dùng khi App Shell mount form độc lập
import React, { useState } from 'react';
import { message } from 'antd';
import ClassForm from '../components/business/ClassForm';
import { createClass } from '../services/pbc-api';
import { emitClassEvent } from '../hooks/event-handlers';
import type { CreateClassData } from '../types';

interface ClassFormSlotProps {
  onSuccess?: () => void;
}

const ClassFormSlot: React.FC<ClassFormSlotProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateClassData) => {
    setLoading(true);
    try {
      await createClass(data);
      message.success('Tạo lớp học thành công');
      emitClassEvent('class.created', data as Record<string, unknown>);
      onSuccess?.();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClassForm
      loading={loading}
      onSubmit={handleSubmit}
      onCancel={() => onSuccess?.()}
    />
  );
};

export default ClassFormSlot;
