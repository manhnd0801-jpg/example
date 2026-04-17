// AI-GENERATED
// Slot: course-list — thin wrapper, orchestrate CourseTable component
import React, { useEffect, useState } from 'react';
import { Button, Modal, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CourseTable from '../components/business/CourseTable';
import CourseForm from '../components/business/CourseForm';
import { listCourses, deleteCourse, createCourse } from '../services/pbc-api';
import { emitCourseEvent } from '../hooks/event-handlers';
import type { CourseDto, CreateCourseData } from '../types';

const CourseListSlot: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
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

  const handleCreate = async (data: CreateCourseData) => {
    setFormLoading(true);
    try {
      await createCourse(data);
      message.success('Tạo khóa học thành công');
      emitCourseEvent('course.created', data as Record<string, unknown>);
      setShowForm(false);
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
          Thêm khóa học
        </Button>
      </Space>

      <CourseTable
        courses={courses}
        total={total}
        page={page}
        loading={loading}
        onEdit={() => setShowForm(true)}
        onDelete={handleDelete}
        onPageChange={setPage}
      />

      <Modal
        title="Thêm khóa học"
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        destroyOnClose
      >
        <CourseForm
          loading={formLoading}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
};

export default CourseListSlot;
