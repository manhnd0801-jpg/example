// AI-GENERATED
// Slot: subject-form — thin wrapper, dùng khi App Shell mount form độc lập
import React, { useState } from 'react';
import { message } from 'antd';
import SubjectForm from '../components/business/SubjectForm';
import { createSubject } from '../services/pbc-api';
import { emitSubjectEvent } from '../hooks/event-handlers';
import type { CreateSubjectData } from '../types';

interface SubjectFormSlotProps {
  onSuccess?: () => void;
}

const SubjectFormSlot: React.FC<SubjectFormSlotProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateSubjectData) => {
    setLoading(true);
    try {
      await createSubject(data);
      message.success('Thêm môn học thành công');
      emitSubjectEvent('subject.created', data as Record<string, unknown>);
      onSuccess?.();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubjectForm
      loading={loading}
      onSubmit={handleSubmit}
      onCancel={() => onSuccess?.()}
    />
  );
};

export default SubjectFormSlot;
