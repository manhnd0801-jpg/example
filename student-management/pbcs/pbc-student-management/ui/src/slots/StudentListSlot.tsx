// AI-GENERATED
// Slot: student-list — thin wrapper, orchestrate StudentTable component
import React, { useEffect, useState } from 'react';
import { Button, Input, Modal, Select, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import StudentTable from '../components/business/StudentTable';
import StudentForm from '../components/business/StudentForm';
import { listStudents, deleteStudent, createStudent } from '../services/pbc-api';
import { emitStudentEvent } from '../hooks/event-handlers';
import type { StudentDto, CreateStudentData } from '../types';

const CourseListSlot: React.FC = () => {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchStudents = async (p = page) => {
    setLoading(true);
    try {
      const res = await listStudents({ page: p, pageSize: 20, search: search || undefined, status });
      setStudents(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [page, search, status]);

  const handleDelete = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      message.success('Xóa sinh viên thành công');
      emitStudentEvent('student.deleted', { studentId });
      fetchStudents();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const handleCreate = async (data: CreateStudentData) => {
    setFormLoading(true);
    try {
      await createStudent(data);
      message.success('Thêm sinh viên thành công');
      emitStudentEvent('student.created', data as Record<string, unknown>);
      setShowForm(false);
      fetchStudents();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Tìm theo tên hoặc mã SV"
          onSearch={setSearch}
          style={{ width: 280 }}
          allowClear
        />
        <Select
          placeholder="Lọc trạng thái"
          allowClear
          style={{ width: 160 }}
          onChange={setStatus}
          options={[
            { value: 'ACTIVE', label: 'Đang học' },
            { value: 'INACTIVE', label: 'Vô hiệu' },
            { value: 'GRADUATED', label: 'Tốt nghiệp' },
            { value: 'SUSPENDED', label: 'Đình chỉ' },
          ]}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
          Thêm sinh viên
        </Button>
      </Space>

      <StudentTable
        students={students}
        total={total}
        page={page}
        loading={loading}
        onEdit={() => setShowForm(true)}
        onDelete={handleDelete}
        onPageChange={setPage}
      />

      <Modal
        title="Thêm sinh viên"
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        destroyOnClose
      >
        <StudentForm
          loading={formLoading}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
};

export default CourseListSlot;
