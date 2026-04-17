// AI-GENERATED
import React from 'react';
import { Form, Input, Select, DatePicker, Button, Space } from 'antd';
import type { StudentDto, CreateStudentData, UpdateStudentData } from '../../types';

interface StudentFormProps {
  initialValues?: Partial<StudentDto>;
  loading?: boolean;
  onSubmit: (data: CreateStudentData | UpdateStudentData) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({
  initialValues, loading, onSubmit, onCancel,
}) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={(values) => onSubmit(values as CreateStudentData | UpdateStudentData)}
    >
      <Form.Item name="studentCode" label="Mã sinh viên"
        rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên' }]}>
        <Input placeholder="VD: SV2026001" />
      </Form.Item>
      <Form.Item name="fullName" label="Họ tên"
        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email"
        rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="phone" label="Số điện thoại">
        <Input />
      </Form.Item>
      {initialValues && (
        <Form.Item name="status" label="Trạng thái">
          <Select>
            <Select.Option value="ACTIVE">Đang học</Select.Option>
            <Select.Option value="INACTIVE">Vô hiệu</Select.Option>
            <Select.Option value="GRADUATED">Đã tốt nghiệp</Select.Option>
            <Select.Option value="SUSPENDED">Đình chỉ</Select.Option>
          </Select>
        </Form.Item>
      )}
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Cập nhật' : 'Thêm sinh viên'}
          </Button>
          <Button onClick={onCancel}>Hủy</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default StudentForm;
