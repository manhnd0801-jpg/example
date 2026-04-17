// AI-GENERATED
// Slot: subject-list — thin wrapper, orchestrate SubjectTable component
import React, { useEffect, useState } from 'react';
import { Button, Modal, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SubjectTable from '../components/business/SubjectTable';
import SubjectForm from '../components/business/SubjectForm';
import { listSubjects, deleteSubject, createSubject } from '../services/pbc-api';
import { emitSubjectEvent } from '../hooks/event-handlers';
import type { SubjectDto, CreateSubjectData } from '../types';

const SubjectListSlot: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
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

  const handleCreate = async (data: CreateSubjectData) => {
    setFormLoading(true);
    try {
      await createSubject(data);
      message.success('Thêm môn học thành công');
      emitSubjectEvent('subject.created', data as Record<string, unknown>);
      setShowForm(false);
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
          Thêm môn học
        </Button>
      </Space>

      <SubjectTable
        subjects={subjects}
        total={total}
        page={page}
        loading={loading}
        onEdit={() => setShowForm(true)}
        onDelete={handleDelete}
        onPageChange={setPage}
      />

      <Modal
        title="Thêm môn học"
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        destroyOnClose
      >
        <SubjectForm
          loading={formLoading}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
};

export default SubjectListSlot;
