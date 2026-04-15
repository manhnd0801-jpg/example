// AI-GENERATED
// Slot: user-management — thin wrapper, orchestrate UserTable + UserForm
import React, { useEffect, useState } from 'react';
import { Button, Modal, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import UserTable from '../components/business/UserTable';
import UserForm from '../components/business/UserForm';
import { listUsers, createUser, updateUser, deleteUser, listRoles } from '../services/pbc-api';
import { emitAuthEvent } from '../hooks/event-handlers';
import type { UserDto, RoleDto, CreateUserData } from '../types';

const { Title } = Typography;

const UserManagementSlot: React.FC = () => {
  const [users, setUsers]         = useState<UserDto[]>([]);
  const [roles, setRoles]         = useState<RoleDto[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async (p = page) => {
    setLoading(true);
    try {
      const res = await listUsers({ page: p, pageSize: 20 });
      setUsers(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    listRoles().then((res) => setRoles(res.data.items)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (user: UserDto) => {
    setEditingUser(user);
    form.setFieldsValue({ email: user.email, fullName: user.fullName, status: user.status });
    setModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      message.success('Đã xóa người dùng');
      fetchUsers();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success('Đã cập nhật người dùng');
      } else {
        const created = await createUser(values as CreateUserData);
        // Phát event lên App Shell → forward lên Kafka
        emitAuthEvent('pbc.auth.user.created', {
          userId: created.data.id,
          username: created.data.username,
          role: created.data.role,
        });
        message.success('Đã tạo người dùng');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý Người dùng</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm người dùng
        </Button>
      </div>

      <UserTable
        users={users}
        total={total}
        page={page}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onPageChange={(p) => { setPage(p); fetchUsers(p); }}
      />

      <Modal
        title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingUser ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
        destroyOnClose
      >
        <UserForm
          form={form}
          editingUser={editingUser}
          roles={roles}
          onFinish={handleSubmit}
        />
      </Modal>
    </div>
  );
};

export default UserManagementSlot;
