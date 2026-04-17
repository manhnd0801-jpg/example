// Slot: student-list — thin wrapper, orchestrate StudentTable component
import React, { useEffect, useState } from 'react';
import { Button, Input, Modal, Select, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import StudentTable from '../components/business/StudentTable';
import StudentForm from '../components/business/StudentForm';
import { listStudents, deleteStudent, createStudent, updateStudent } from '../services/pbc-api';
import { emitStudentEvent } from '../hooks/event-handlers';
import type { StudentDto, CreateStudentData, UpdateStudentData } from '../types';

const StudentListSlot: React.FC = () => {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentDto | null>(null);
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

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleOpenEdit = (student: StudentDto) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

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

  const handleSubmit = async (data: CreateStudentData | UpdateStudentData) => {
    setFormLoading(true);
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, data as UpdateStudentData);
        message.success('Cập nhật sinh viên thành công');
        emitStudentEvent('student.updated', data as Record<string, unknown>);
      } else {
        await createStudent(data as CreateStudentData);
        message.success('Thêm sinh viên thành công');
        emitStudentEvent('student.created', data as Record<string, unknown>);
      }
      handleCloseForm();
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          Thêm sinh viên
        </Button>
      </Space>

      <StudentTable
        students={students}
        total={total}
        page={page}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onPageChange={setPage}
      />

      <Modal
        title={editingStudent ? 'Sửa sinh viên' : 'Thêm sinh viên'}
        open={showForm}
        onCancel={handleCloseForm}
        footer={null}
        destroyOnClose
      >
        <StudentForm
          initialValues={editingStudent ?? undefined}
          loading={formLoading}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
        />
      </Modal>
    </div>
  );
};

export default StudentListSlot;
