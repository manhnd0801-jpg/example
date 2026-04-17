// AI-GENERATED
// Slot: student-status — thay đổi trạng thái sinh viên
import React, { useState } from 'react';
import { Select, Button, Space, Tag, message } from 'antd';
import { updateStudent } from '../services/pbc-api';
import { emitStudentEvent } from '../hooks/event-handlers';
import type { StudentStatus } from '../types';

const TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  ACTIVE:    ['INACTIVE', 'GRADUATED', 'SUSPENDED'],
  INACTIVE:  ['ACTIVE'],
  GRADUATED: [],
  SUSPENDED: ['ACTIVE'],
};

const STATUS_COLOR: Record<StudentStatus, string> = {
  ACTIVE: 'green', INACTIVE: 'default', GRADUATED: 'blue', SUSPENDED: 'red',
};

interface StudentStatusSlotProps {
  studentId?: string;
  currentStatus?: StudentStatus;
  onStatusChange?: (status: StudentStatus) => void;
}

const StudentStatusSlot: React.FC<StudentStatusSlotProps> = ({
  studentId,
  currentStatus = 'ACTIVE',
  onStatusChange,
}) => {
  const [newStatus, setNewStatus] = useState<StudentStatus | undefined>();
  const [loading, setLoading] = useState(false);
  const allowed = TRANSITIONS[currentStatus];

  const handleChange = async () => {
    if (!studentId || !newStatus) return;
    setLoading(true);
    try {
      await updateStudent(studentId, { status: newStatus });
      message.success(`Đã chuyển trạng thái sang ${newStatus}`);
      emitStudentEvent('student.updated', { studentId, status: newStatus });
      onStatusChange?.(newStatus);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space>
      <span>Trạng thái hiện tại: <Tag color={STATUS_COLOR[currentStatus]}>{currentStatus}</Tag></span>
      <Select
        placeholder="Chọn trạng thái mới"
        style={{ width: 180 }}
        disabled={allowed.length === 0}
        onChange={(v) => setNewStatus(v as StudentStatus)}
        options={allowed.map((s) => ({ value: s, label: s }))}
      />
      <Button type="primary" loading={loading} disabled={!newStatus} onClick={handleChange}>
        Cập nhật
      </Button>
    </Space>
  );
};

export default StudentStatusSlot;
