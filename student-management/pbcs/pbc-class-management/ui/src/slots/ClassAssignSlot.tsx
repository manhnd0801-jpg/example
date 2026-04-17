// AI-GENERATED
// Slot: class-assign — phân công giảng viên cho lớp học
import React, { useState } from 'react';
import { Form, Input, Button, Space, Card, message } from 'antd';
import { assignTeacher } from '../services/pbc-api';
import { emitClassEvent } from '../hooks/event-handlers';

interface ClassAssignSlotProps {
  classId?: string;
  onAssigned?: () => void;
}

const ClassAssignSlot: React.FC<ClassAssignSlotProps> = ({ classId, onAssigned }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async ({ teacherId }: { teacherId: string }) => {
    if (!classId) { message.warning('Chưa chọn lớp học'); return; }
    setLoading(true);
    try {
      await assignTeacher(classId, teacherId);
      message.success('Phân công giảng viên thành công');
      emitClassEvent('class.updated', { classId, teacherId });
      form.resetFields();
      onAssigned?.();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Phân công giảng viên" style={{ margin: 24, maxWidth: 480 }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="teacherId"
          label="Teacher ID"
          rules={[{ required: true, message: 'Vui lòng nhập Teacher ID' }]}
        >
          <Input placeholder="Nhập ID giảng viên" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Phân công
            </Button>
            <Button onClick={() => form.resetFields()}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ClassAssignSlot;
