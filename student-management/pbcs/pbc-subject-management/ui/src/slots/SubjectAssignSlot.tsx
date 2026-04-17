// AI-GENERATED
// Slot: subject-assign — gán môn học vào khóa học
import React, { useState } from 'react';
import { Form, Input, Button, Space, Card, message } from 'antd';
import { emitSubjectEvent } from '../hooks/event-handlers';

interface SubjectAssignSlotProps {
  courseId?: string;
  onAssigned?: () => void;
}

const SubjectAssignSlot: React.FC<SubjectAssignSlotProps> = ({ courseId, onAssigned }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async ({ subjectId }: { subjectId: string }) => {
    if (!courseId) { message.warning('Chưa chọn khóa học'); return; }
    setLoading(true);
    try {
      // Gọi API gán môn học vào khóa học
      const token = localStorage.getItem('accessToken') ?? '';
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:3015'}/v1/subjects/${subjectId}/assign`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Tenant-Id': localStorage.getItem('tenantId') ?? 'default',
          },
          body: JSON.stringify({ data: { courseId }, metadata: { correlationId: crypto.randomUUID() } }),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      message.success('Gán môn học vào khóa học thành công');
      emitSubjectEvent('subject.updated', { subjectId, courseId });
      form.resetFields();
      onAssigned?.();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Gán môn học vào khóa học" style={{ margin: 24, maxWidth: 480 }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="subjectId"
          label="Subject ID"
          rules={[{ required: true, message: 'Vui lòng nhập Subject ID' }]}
        >
          <Input placeholder="Nhập ID môn học" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Gán môn học
            </Button>
            <Button onClick={() => form.resetFields()}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SubjectAssignSlot;
