// AI-GENERATED
import React from 'react';
import { Form, Input, InputNumber, Select, Button, Space } from 'antd';
import type { SubjectDto, CreateSubjectData, UpdateSubjectData } from '../../types';

interface SubjectFormProps {
  initialValues?: Partial<SubjectDto>;
  loading?: boolean;
  onSubmit: (data: CreateSubjectData | UpdateSubjectData) => void;
  onCancel: () => void;
}

const SubjectForm: React.FC<SubjectFormProps> = ({
  initialValues, loading, onSubmit, onCancel,
}) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={(values) => onSubmit(values as CreateSubjectData | UpdateSubjectData)}
    >
      <Form.Item name="subjectCode" label="Mã môn học"
        rules={[{ required: true, message: 'Vui lòng nhập mã môn học' }]}>
        <Input placeholder="VD: MATH101" />
      </Form.Item>
      <Form.Item name="name" label="Tên môn học"
        rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}>
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
          </Select>
        </Form.Item>
      )}
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Cập nhật' : 'Thêm môn học'}
          </Button>
          <Button onClick={onCancel}>Hủy</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default SubjectForm;
