// AI-GENERATED
import React from 'react';
import { Form, Input, InputNumber, Select, Button, Space } from 'antd';
import type { CourseDto, CreateCourseData, UpdateCourseData } from '../../types';

interface CourseFormProps {
  initialValues?: Partial<CourseDto>;
  loading?: boolean;
  onSubmit: (data: CreateCourseData | UpdateCourseData) => void;
  onCancel: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({
  initialValues, loading, onSubmit, onCancel,
}) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={(values) => onSubmit(values as CreateCourseData | UpdateCourseData)}
    >
      <Form.Item name="courseCode" label="Mã khóa học"
        rules={[{ required: true, message: 'Vui lòng nhập mã khóa học' }]}>
        <Input placeholder="VD: CS101" />
      </Form.Item>
      <Form.Item name="name" label="Tên khóa học"
        rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Mô tả">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="credits" label="Số tín chỉ"
        rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ' }]}>
        <InputNumber min={1} max={10} style={{ width: '100%' }} />
      </Form.Item>
      {initialValues && (
        <Form.Item name="status" label="Trạng thái">
          <Select>
            <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
            <Select.Option value="INACTIVE">Vô hiệu</Select.Option>
            <Select.Option value="ARCHIVED">Lưu trữ</Select.Option>
          </Select>
        </Form.Item>
      )}
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Cập nhật' : 'Tạo khóa học'}
          </Button>
          <Button onClick={onCancel}>Hủy</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CourseForm;
