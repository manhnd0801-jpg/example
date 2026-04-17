// AI-GENERATED
// Slot: class-list — thin wrapper, orchestrate ClassTable component
import React, { useEffect, useState } from 'react';
import { Button, Modal, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ClassTable from '../components/business/ClassTable';
import ClassForm from '../components/business/ClassForm';
import { listClasses, deleteClass } from '../services/pbc-api';
import { emitClassEvent } from '../hooks/event-handlers';
import type { ClassDto, CreateClassData } from '../types';

const ClassListSlot: React.FC = () => {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchClasses = async (p = page) => {
    setLoading(true);
    try {
      const res = await listClasses({ page: p, pageSize: 20 });
      setClasses(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, [page]);

  const handleDelete = async (classId: string) => {
    try {
      await deleteClass(classId);
      message.success('Xóa lớp học thành công');
      emitClassEvent('class.deleted', { classId });
      fetchClasses();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
          Thêm lớp học
        </Button>
      </Space>

      <ClassTable
        classes={classes}
        total={total}
        page={page}
        loading={loading}
        onEdit={() => setShowForm(true)}
        onDelete={handleDelete}
        onAssign={() => {}}
        onPageChange={setPage}
      />

      <Modal
        title="Thêm lớp học"
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        destroyOnClose
      >
        <ClassForm
          loading={formLoading}
          onSubmit={async (data) => {
            setFormLoading(true);
            try {
              const { createClass } = await import('../services/pbc-api');
              await createClass(data as CreateClassData);
              message.success('Tạo lớp học thành công');
              emitClassEvent('class.created', data as Record<string, unknown>);
              setShowForm(false);
              fetchClasses();
            } catch (err) {
              message.error((err as Error).message);
            } finally {
              setFormLoading(false);
            }
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
};

export default ClassListSlot;
