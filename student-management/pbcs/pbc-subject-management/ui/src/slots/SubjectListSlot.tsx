// Slot: subject-list — thin wrapper, orchestrate SubjectTable component
import React, { useEffect, useState } from 'react';
import { Button, Modal, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SubjectTable from '../components/business/SubjectTable';
import SubjectForm from '../components/business/SubjectForm';
import { listSubjects, deleteSubject, createSubject, updateSubject } from '../services/pbc-api';
import { emitSubjectEvent } from '../hooks/event-handlers';
import type { SubjectDto, CreateSubjectData, UpdateSubjectData } from '../types';

const SubjectListSlot: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectDto | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchSubjects = async (p = page) => {
    setLoading(true);
    try {
      const res = await listSubjects({ page: p, pageSize: 20 });
      setSubjects(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, [page]);

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setShowForm(true);
  };

  const handleOpenEdit = (subject: SubjectDto) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSubject(null);
  };

  const handleDelete = async (subjectId: string) => {
    try {
      await deleteSubject(subjectId);
      message.success('Xóa môn học thành công');
      emitSubjectEvent('subject.deleted', { subjectId });
      fetchSubjects();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const handleSubmit = async (data: CreateSubjectData | UpdateSubjectData) => {
    setFormLoading(true);
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, data as UpdateSubjectData);
        message.success('Cập nhật môn học thành công');
        emitSubjectEvent('subject.updated', data as Record<string, unknown>);
      } else {
        await createSubject(data as CreateSubjectData);
        message.success('Thêm môn học thành công');
        emitSubjectEvent('subject.created', data as Record<string, unknown>);
      }
      handleCloseForm();
      fetchSubjects();
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
          Thêm môn học
        </Button>
      </Space>

      <SubjectTable
        subjects={subjects}
        total={total}
        page={page}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onPageChange={setPage}
      />

      <Modal
        title={editingSubject ? 'Sửa môn học' : 'Thêm môn học'}
        open={showForm}
        onCancel={handleCloseForm}
        footer={null}
        destroyOnClose
      >
        <SubjectForm
          initialValues={editingSubject ?? undefined}
          loading={formLoading}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
        />
      </Modal>
    </div>
  );
};

export default SubjectListSlot;
