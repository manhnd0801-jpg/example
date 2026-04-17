// AI-GENERATED
// Slot: audit-log — nhật ký hệ thống
import React, { useEffect, useState } from 'react';
import { Table, Input, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { listAuditLogs } from '../services/pbc-api';
import type { AuditLogDto } from '../types';

const { Text } = Typography;

interface AuditLogSlotProps {
  resourceType?: string;
  resourceId?: string;
}

const AuditLogSlot: React.FC<AuditLogSlotProps> = ({ resourceType, resourceId }) => {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [resource, setResource] = useState(resourceType ?? '');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (p = page) => {
    setLoading(true);
    try {
      const res = await listAuditLogs({
        page: p,
        pageSize: 20,
        resource: resource || undefined,
      });
      setLogs(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, resource]);

  const columns: ColumnsType<AuditLogDto> = [
    {
      title: 'Hành động', dataIndex: 'action', key: 'action',
      render: (v) => <Text code style={{ fontSize: 11 }}>{v}</Text>,
    },
    { title: 'Tài nguyên', dataIndex: 'resource', key: 'resource' },
    {
      title: 'Resource ID', dataIndex: 'resourceId', key: 'resourceId',
      render: (v) => v ? <Text copyable style={{ fontSize: 11 }}>{String(v).slice(0, 8)}…</Text> : '—',
    },
    { title: 'Người dùng', dataIndex: 'userId', key: 'userId' },
    {
      title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt',
      render: (v) => new Date(v).toLocaleString('vi-VN'),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Input.Search
        placeholder="Lọc theo tài nguyên"
        defaultValue={resourceType}
        onSearch={setResource}
        style={{ width: 320, marginBottom: 16 }}
        allowClear
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={logs}
        loading={loading}
        size="small"
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
      />
    </div>
  );
};

export default AuditLogSlot;
