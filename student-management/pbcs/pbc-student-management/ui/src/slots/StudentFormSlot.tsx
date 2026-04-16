// AI-GENERATED
import React from 'react';
import { Form, Input, Select, DatePicker, Button, message } from 'antd';
import { studentApi } from '../services/pbc-api';

interface Props { studentId?: string; onSuccess?: () => void; }

export default function StudentFormSlot({ studentId, onSuccess }: Props) {
  const [form] = Form.useForm();
  const isEdit = !!studentId;

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit) {
        await studentApi.update(studentId!, values);
        message.success('Cập nhật sinh viên thành công');
      } else {
        await studentApi.create(values);
        message.success('Tạo sinh viên thành công');
      }
      form.resetFields();
      onSuccess?.();
    } catch {
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 600 }}>
      <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
        <Input placeholder="Nguyễn Văn A" />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
        <Input placeholder="example@email.com" />
      </Form.Item>
      <Form.Item name="phone" label="Số điện thoại">
        <Input placeholder="0123456789" />
      </Form.Item>
      <Form.Item name="gender" label="Giới tính">
        <Select options={[
          { value: 'MALE', label: 'Nam' },
          { value: 'FEMALE', label: 'Nữ' },
          { value: 'OTHER', label: 'Khác' },
        ]} />
      </Form.Item>
      <Form.Item name="dateOfBirth" label="Ngày sinh">
        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
      </Form.Item>
      <Form.Item name="address" label="Địa chỉ">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {isEdit ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </Form.Item>
    </Form>
  );
}
