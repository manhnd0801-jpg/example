// AI-GENERATED
import React from 'react';
import { Form, Input, InputNumber, Select, Button, message } from 'antd';
import axios from 'axios';

const BASE = import.meta.env.VITE_SUBJECT_MGMT_URL || 'http://localhost:3005';
const token = () => localStorage.getItem('accessToken');
const tenantId = () => localStorage.getItem('tenantId') || 'dev-tenant';

export default function SubjectFormSlot({ onSuccess }: { onSuccess?: () => void }) {
  const [form] = Form.useForm();
  const handleSubmit = async (values: any) => {
    try {
      await axios.post(`${BASE}/v1/subjects`, { data: values, metadata: { tenantId: tenantId() } }, { headers: { Authorization: `Bearer ${token()}` } });
      message.success('Tạo môn học thành công');
      form.resetFields();
      onSuccess?.();
    } catch (err: any) { message.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 500 }}>
      <Form.Item name="subjectCode" label="Mã môn học" rules={[{ required: true }]}><Input placeholder="CS101" /></Form.Item>
      <Form.Item name="subjectName" label="Tên môn học" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
      <Form.Item name="theoryCredits" label="Tín chỉ lý thuyết" initialValue={2}><InputNumber min={0} max={10} style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="practiceCredits" label="Tín chỉ thực hành" initialValue={1}><InputNumber min={0} max={10} style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="subjectType" label="Loại môn học" initialValue="REQUIRED">
        <Select options={[{ value: 'REQUIRED', label: 'Bắt buộc' }, { value: 'ELECTIVE', label: 'Tự chọn' }, { value: 'FREE_ELECTIVE', label: 'Tự chọn tự do' }]} />
      </Form.Item>
      <Form.Item><Button type="primary" htmlType="submit">Tạo môn học</Button></Form.Item>
    </Form>
  );
}
