// AI-GENERATED
import React from 'react';
import { Form, Input, InputNumber, Select, Button, message } from 'antd';
import axios from 'axios';

const BASE = import.meta.env.VITE_COURSE_MGMT_URL || 'http://localhost:3004';

export default function CourseFormSlot({ onSuccess }: { onSuccess?: () => void }) {
  const [form] = Form.useForm();
  const handleSubmit = async (values: any) => {
    try {
      await axios.post(`${BASE}/v1/courses`, { data: values, metadata: { tenantId: 'tenant-default' } }, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });
      message.success('Tạo chương trình thành công');
      form.resetFields();
      onSuccess?.();
    } catch { message.error('Có lỗi xảy ra'); }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 500 }}>
      <Form.Item name="courseCode" label="Mã chương trình" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="courseName" label="Tên chương trình" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
      <Form.Item name="durationYears" label="Số năm đào tạo" initialValue={4}><InputNumber min={1} max={6} style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="totalCredits" label="Tổng tín chỉ" initialValue={140}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="status" label="Trạng thái" initialValue="UPCOMING">
        <Select options={[{ value: 'UPCOMING', label: 'Sắp mở' }, { value: 'ACTIVE', label: 'Đang hoạt động' }, { value: 'CLOSED', label: 'Đã đóng' }]} />
      </Form.Item>
      <Form.Item><Button type="primary" htmlType="submit">Tạo chương trình</Button></Form.Item>
    </Form>
  );
}
