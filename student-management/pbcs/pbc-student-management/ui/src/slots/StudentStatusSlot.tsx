// AI-GENERATED
import React, { useState } from 'react';
import { Select, Button, Space, message, Tag } from 'antd';
import type { StudentStatus } from '../types';
import { studentApi } from '../services/pbc-api';

const TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  ACTIVE: ['SUSPENDED', 'GRADUATED', 'DROPPED_OUT'],
  SUSPENDED: ['ACTIVE'],
  GRADUATED: [],
  DROPPED_OUT: [],
};

interface Props { studentId: string; currentStatus: StudentStatus; onSuccess?: () => void; }

export default function StudentStatusSlot({ studentId, currentStatus, onSuccess }: Props) {
  const [newStatus, setNewStatus] = useState<StudentStatus | undefined>();
  const [loading, setLoading] = useState(false);
  const allowed = TRANSITIONS[currentStatus];

  const handleChange = async () => {
    if (!newStatus) return;
    setLoading(true);
    try {
      await studentApi.changeStatus(studentId, newStatus);
      message.success(`Đã chuyển trạng thái sang ${newStatus}`);
      onSuccess?.();
    } catch (err: any) {
      message.error(err?.response?.data?.metadata?.error?.message || 'Không thể thay đổi trạng thái');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space>
      <span>Trạng thái hiện tại: <Tag color="blue">{currentStatus}</Tag></span>
      <Select
        placeholder="Chọn trạng thái mới"
        style={{ width: 180 }}
        disabled={allowed.length === 0}
        onChange={(v) => setNewStatus(v as StudentStatus)}
        options={allowed.map(s => ({ value: s, label: s }))}
      />
      <Button type="primary" loading={loading} disabled={!newStatus} onClick={handleChange}>
        Cập nhật
      </Button>
    </Space>
  );
}
