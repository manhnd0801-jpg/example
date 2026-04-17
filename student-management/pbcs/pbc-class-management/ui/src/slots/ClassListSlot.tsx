// Slot: class-list — thin wrapper, orchestrate ClassTable component
import React, { useEffect, useState } from 'react';
import { Button, Modal, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ClassTable from '../components/business/ClassTable';
import ClassForm from '../components/business/ClassForm';
import { listClasses, deleteClass, createClass, updateClass } from '../services/pbc-api';
import { emitClassEvent } from '../hooks/event-handlers';
import type { ClassDto, CreateClassData, UpdateClassData } from '../types';

const ClassListSlot: React.FC = () => {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassDto | null>(null);
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

  const handleOpenCreate = () => {
    setEditingClass(null);
    setShowForm(true);
  };

  const handleOpenEdit = (cls: ClassDto) => {
    setEditingClass(cls);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClass(null);
  };

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

  const handleSubmit = async (data: CreateClassData | UpdateClassData) => {
    setFormLoading(true);
    try {
      if (editingClass) {
        await updateClass(editingClass.id, data as UpdateClassData);
        message.success('Cập nhật lớp học thành công');
        emitClassEvent('class.updated', data as Record<string, unknown>);
      } else {
        await createClass(data as CreateClassData);
        message.success('Tạo lớp học thành công');
        emitClassEvent('class.created', data as Record<string, unknown>);
      }
      handleCloseForm();
      fetchClasses();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          Thêm lớp học
        </Button>
      </Space>

      <ClassTable
        classes={classes}
        total={total}
        page={page}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onAssign={() => {}}
        onPageChange={setPage}
      />

      <Modal
        title={editingClass ? 'Sửa lớp học' : 'Thêm lớp học'}
        open={showForm}
        onCancel={handleCloseForm}
        footer={null}
        destroyOnClose
      >
        <ClassForm
          initialValues={editingClass ?? undefined}
          loading={formLoading}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
        />
      </Modal>
    </div>
  );
};

export default ClassListSlot;
