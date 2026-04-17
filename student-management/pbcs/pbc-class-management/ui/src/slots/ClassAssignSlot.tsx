// AI-GENERATED
import React, { useState } from 'react';
import { Input, Button, Space, message } from 'antd';
import axios from 'axios';

const BASE = import.meta.env.VITE_CLASS_MGMT_URL || 'http://localhost:3003';

export default function ClassAssignSlot({ classId, onSuccess }: { classId: string; onSuccess?: () => void }) {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };

  const handleAssign = async () => {
    if (!studentId.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${BASE}/v1/classes/${classId}/students`,
        { data: { studentId }, metadata: { tenantId: localStorage.getItem('tenantId') || 'dev-tenant' } },
        { headers });
      message.success('Gán sinh viên thành công');
      setStudentId('');
      onSuccess?.();
    } catch (err: any) {
      message.error(err?.response?.data?.metadata?.error?.message || 'Không thể gán sinh viên');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space>
      <Input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Nhập Student ID" style={{ width: 300 }} />
      <Button type="primary" loading={loading} onClick={handleAssign}>Gán vào lớp</Button>
    </Space>
  );
}
