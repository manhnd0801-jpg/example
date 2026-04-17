// Slot: course-list — thin wrapper, orchestrate CourseTable component
import React, { useEffect, useState } from 'react';
import { Button, Modal, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CourseTable from '../components/business/CourseTable';
import CourseForm from '../components/business/CourseForm';
import { listCourses, deleteCourse, createCourse, updateCourse } from '../services/pbc-api';
import { emitCourseEvent } from '../hooks/event-handlers';
import type { CourseDto, CreateCourseData, UpdateCourseData } from '../types';

const CourseListSlot: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDto | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCourses = async (p = page) => {
    setLoading(true);
    try {
      const res = await listCourses({ page: p, pageSize: 20 });
      setCourses(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, [page]);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleOpenEdit = (course: CourseDto) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleDelete = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      message.success('Xóa khóa học thành công');
      emitCourseEvent('course.deleted', { courseId });
      fetchCourses();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const handleSubmit = async (data: CreateCourseData | UpdateCourseData) => {
    setFormLoading(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, data as UpdateCourseData);
        message.success('Cập nhật khóa học thành công');
        emitCourseEvent('course.updated', data as Record<string, unknown>);
      } else {
        await createCourse(data as CreateCourseData);
        message.success('Tạo khóa học thành công');
        emitCourseEvent('course.created', data as Record<string, unknown>);
      }
      handleCloseForm();
      fetchCourses();
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
          Thêm khóa học
        </Button>
      </Space>

      <CourseTable
        courses={courses}
        total={total}
        page={page}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onPageChange={setPage}
      />

      <Modal
        title={editingCourse ? 'Sửa khóa học' : 'Thêm khóa học'}
        open={showForm}
        onCancel={handleCloseForm}
        footer={null}
        destroyOnClose
      >
        <CourseForm
          initialValues={editingCourse ?? undefined}
          loading={formLoading}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
        />
      </Modal>
    </div>
  );
};

export default CourseListSlot;
