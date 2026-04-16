// AI-GENERATED
import React, { useEffect, useState } from 'react';
import { Table, Input, message, Typography } from 'antd';
import axios from 'axios';

const BASE = import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:3006';

export default function AuditLogSlot() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState('');
  const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` };

  const fetch = () => {
    setLoading(true);
    axios.get(`${BASE}/v1/audit-logs`, { params: { page, pageSize: 20, eventType: eventType || undefined }, headers })
      .then(r => { setLogs(r.data.data.auditLogs || []); setTotal(r.data.data.pagination?.total || 0); })
      .catch(err => {
        if (err?.response?.status === 403) message.error('Chỉ Admin mới có quyền xem audit logs');
        else message.error('Không thể tải audit logs');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page, eventType]);

  const columns = [
    { title: 'Event Type', dataIndex: 'eventType', key: 'eventType', render: (t: string) => <Typography.Text code style={{ fontSize: 11 }}>{t}</Typography.Text> },
    { title: 'Aggregate ID', dataIndex: 'aggregateId', key: 'aggregateId', render: (id: string) => id ? <Typography.Text copyable style={{ fontSize: 11 }}>{id?.slice(0, 8)}...</Typography.Text> : '-' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Thời gian', dataIndex: 'occurredAt', key: 'occurredAt', render: (t: string) => new Date(t).toLocaleString('vi-VN') },
  ];

  return (
    <div>
      <Input.Search placeholder="Lọc theo event type" onSearch={setEventType} style={{ width: 320, marginBottom: 16 }} allowClear />
      <Table rowKey="id" columns={columns} dataSource={logs} loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: setPage }} size="small" />
    </div>
  );
}
