// AI-GENERATED
import React from 'react';
import { Form, Input, InputNumber, Select, Button, message } from 'antd';
import axios from 'axios';

const BASE = import.meta.env.VITE_CLASS_MGMT_URL || 'http://localhost:3003';
const token = () => localStorage.getItem('accessToken');
const tenantId = () => localStorage.getItem('tenantId') || 'dev-tenant';

export default function ClassFormSlot({ onSuccess }: { onSuccess?: () => void }) {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      await axios.post(`${BASE}/v1/classes`, { data: values, metadata: { tenantId: tenantId() } }, { headers: { Authorization: `Bearer ${token()}` } });
      message.success('Tạo lớp học thành công');
      form.resetFields();
      onSuccess?.();
    } catch (err: any) { message.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 500 }}>
      <Form.Item name="classCode" label="Mã lớp" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="className" label="Tên lớp" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="academicYear" label="Năm học" rules={[{ required: true }]}><Input placeholder="2024-2025" /></Form.Item>
      <Form.Item name="maxStudents" label="Sĩ số tối đa" initialValue={30}><InputNumber min={1} max={100} style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="status" label="Trạng thái" initialValue="PLANNED">
        <Select options={[{ value: 'PLANNED', label: 'Kế hoạch' }, { value: 'ACTIVE', label: 'Đang học' }, { value: 'COMPLETED', label: 'Hoàn thành' }]} />
      </Form.Item>
      <Form.Item><Button type="primary" htmlType="submit">Tạo lớp học</Button></Form.Item>
    </Form>
  );
}
