// AI-GENERATED
import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Tabs, message } from 'antd';
import axios from 'axios';

const BASE = import.meta.env.VITE_SUBJECT_MGMT_URL || 'http://localhost:3005';
const token = () => localStorage.getItem('accessToken');
const tenantId = () => localStorage.getItem('tenantId') || 'dev-tenant';

export default function SubjectAssignSlot({ subjectId, onSuccess }: { subjectId: string; onSuccess?: () => void }) {
  const [classForm] = Form.useForm();
  const [courseForm] = Form.useForm();

  const assignToClass = async (values: any) => {
    try {
      await axios.post(`${BASE}/v1/subjects/${subjectId}/assign-to-class`,
        { data: values, metadata: { tenantId: tenantId() } },
        { headers: { Authorization: `Bearer ${token()}` } });
      message.success('Gán môn học vào lớp thành công');
      classForm.resetFields();
      onSuccess?.();
    } catch (err: any) { message.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
  };

  const assignToCourse = async (values: any) => {
    try {
      await axios.post(`${BASE}/v1/subjects/${subjectId}/assign-to-course`,
        { data: values, metadata: { tenantId: tenantId() } },
        { headers: { Authorization: `Bearer ${token()}` } });
      message.success('Gán môn học vào chương trình thành công');
      courseForm.resetFields();
      onSuccess?.();
    } catch (err: any) { message.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
  };

  return (
    <Tabs items={[
      {
        key: 'class', label: 'Gán vào lớp',
        children: (
          <Form form={classForm} layout="vertical" onFinish={assignToClass} style={{ maxWidth: 400 }}>
            <Form.Item name="classId" label="Class ID" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="semester" label="Học kỳ" initialValue={1}><InputNumber min={1} max={8} style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="teacherId" label="Teacher ID"><Input /></Form.Item>
            <Form.Item><Button type="primary" htmlType="submit">Gán vào lớp</Button></Form.Item>
          </Form>
        ),
      },
      {
        key: 'course', label: 'Gán vào chương trình',
        children: (
          <Form form={courseForm} layout="vertical" onFinish={assignToCourse} style={{ maxWidth: 400 }}>
            <Form.Item name="courseId" label="Course ID" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="semesterId" label="Học kỳ" initialValue={1}><InputNumber min={1} max={8} style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="isRequired" label="Bắt buộc" initialValue={true}>
              <Select options={[{ value: true, label: 'Bắt buộc' }, { value: false, label: 'Tự chọn' }]} />
            </Form.Item>
            <Form.Item><Button type="primary" htmlType="submit">Gán vào chương trình</Button></Form.Item>
          </Form>
        ),
      },
    ]} />
  );
}
