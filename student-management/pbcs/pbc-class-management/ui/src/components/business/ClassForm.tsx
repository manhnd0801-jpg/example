// AI-GENERATED
import React from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Button, Space } from 'antd';
import type { ClassDto, CreateClassData, UpdateClassData, ClassStatus } from '../../types';

interface ClassFormProps {
  initialValues?: Partial<ClassDto>;
  loading?: boolean;
  onSubmit: (data: CreateClassData | UpdateClassData) => void;
  onCancel: () => void;
}

const ClassForm: React.FC<ClassFormProps> = ({
  initialValues, loading, onSubmit, onCancel,
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: Record<string, unknown>) => {
    onSubmit(values as CreateClassData | UpdateClassData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleFinish}
    >
      <Form.Item name="classCode" label="Mã lớp"
        rules={[{ required: true, message: 'Vui lòng nhập mã lớp' }]}>
        <Input placeholder="VD: CS101-2026A" />
      </Form.Item>
      <Form.Item name="name" label="Tên lớp"
        rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}>
        <Input placeholder="VD: Lập trình cơ bản - Nhóm A" />
      </Form.Item>
      <Form.Item name="maxStudents" label="Sĩ số tối đa"
        rules={[{ required: true, message: 'Vui lòng nhập sĩ số' }]}>
        <InputNumber min={1} max={200} style={{ width: '100%' }} />
      </Form.Item>
      {initialValues && (
        <Form.Item name="status" label="Trạng thái">
          <Select>
            <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
            <Select.Option value="INACTIVE">Vô hiệu</Select.Option>
            <Select.Option value="COMPLETED">Đã kết thúc</Select.Option>
          </Select>
        </Form.Item>
      )}
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Cập nhật' : 'Tạo lớp học'}
          </Button>
          <Button onClick={onCancel}>Hủy</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ClassForm;
