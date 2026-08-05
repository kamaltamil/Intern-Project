import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Tag, Popconfirm, message,
  Skeleton, Alert, Typography, Space, Modal, Form, Input, Select,
} from 'antd';
import { DeleteOutlined, EditOutlined, UserOutlined, TeamOutlined, CrownOutlined } from '@ant-design/icons';
import api from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { useSelector, useDispatch } from 'react-redux';
import { setUsers, startUserLoading, setUserError } from '../store/slices/userSlice';
import { setRoles, startRoleLoading } from '../store/slices/roleSlice';

const { Title } = Typography;
const { Option } = Select;

const roleColor = {
  Admin: 'red',
  Manager: 'orange',
  Member: 'blue',
};

function UsersManagementPage() {
  const dispatch = useDispatch();
  const { users = [], loading, error } = useSelector((state) => state.user);
  const { roles = [] } = useSelector((state) => state.role);

  const [updatingId, setUpdatingId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();

  const loadUsers = async () => {
    try {
      dispatch(startUserLoading(true));
      const response = await api.get('/users');
      dispatch(setUsers(response.data || []));
    } catch {
      dispatch(setUserError('Unable to load users'));
    } finally {
      dispatch(startUserLoading(false));
    }
  };

  const loadRoles = async () => {
    if (roles.length > 0) return;
    try {
      dispatch(startRoleLoading());
      const response = await api.get('/roles');
      dispatch(setRoles(response.data || []));
    } catch {
      // silently fail — roles dropdown just won't have custom roles
    }
  };

  useEffect(() => {
    if (users.length === 0) loadUsers();
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Edit modal ────────────────────────────────────────────
  const openEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const values = await form.validateFields();
      setEditLoading(true);
      const response = await api.patch(`/users/${editingUser._id}`, values);
      const updatedUser = response.data.user;
      dispatch(setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u))));
      message.success('User updated successfully');
      setEditModalOpen(false);
    } catch (err) {
      if (err?.errorFields) return; // form validation error
      message.error(err?.response?.data?.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (userId) => {
    try {
      setUpdatingId(userId);
      await api.delete(`/users/${userId}`);
      dispatch(setUsers(users.filter((u) => u._id !== userId)));
      message.success('User deleted successfully');
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to delete user');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Role options: built-in + custom from DB ───────────────
  const builtInRoles = ['Admin', 'Manager', 'Member'];
  const customRoleNames = roles.map((r) => r.name).filter((n) => !builtInRoles.includes(n));
  const allRoleOptions = [...builtInRoles, ...customRoleNames];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#C76A34] flex items-center justify-center text-white font-semibold text-sm">
            {name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => <span className="text-gray-600">{email}</span>,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (username) => <span className="text-gray-500">@{username}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={roleColor[role] || 'purple'}>{role}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
            style={{ borderColor: '#C76A34', color: '#C76A34' }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete User"
            description={`Are you sure you want to delete ${record.name}?`}
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={updatingId === record._id}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && users.length === 0) {
    return (
      <DashboardLayout>
        <Skeleton active paragraph={{ rows: 6 }} />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert type="error" message={error} showIcon />
      </DashboardLayout>
    );
  }

  const totalAdmins = users.filter((u) => u.role === 'Admin').length;
  const totalManagers = users.filter((u) => u.role === 'Manager').length;
  const totalMembers = users.filter((u) => u.role === 'Member').length;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Title level={4} className="!text-[#2E2A27]">User Management</Title>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm text-center">
            <CrownOutlined className="text-2xl text-red-500 mb-1" />
            <div className="text-2xl font-bold text-[#C76A34]">{totalAdmins}</div>
            <div className="text-gray-500">Admins</div>
          </Card>
          <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm text-center">
            <TeamOutlined className="text-2xl text-orange-500 mb-1" />
            <div className="text-2xl font-bold text-[#C76A34]">{totalManagers}</div>
            <div className="text-gray-500">Managers</div>
          </Card>
          <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm text-center">
            <UserOutlined className="text-2xl text-blue-500 mb-1" />
            <div className="text-2xl font-bold text-[#C76A34]">{totalMembers}</div>
            <div className="text-gray-500">Members</div>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-[#2E2A27]">All Users ({users.length})</span>
            <Button onClick={loadUsers} size="small" loading={loading}>Refresh</Button>
          </div>
          <Table
            rowKey="_id"
            dataSource={users}
            columns={columns}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 600 }}
          />
        </Card>
      </div>

      {/* Edit User Modal */}
      <Modal
        title={
          <span className="text-[#2E2A27] font-semibold">
            Edit User — {editingUser?.name}
          </span>
        }
        open={editModalOpen}
        onOk={handleEditSave}
        onCancel={() => setEditModalOpen(false)}
        okText="Save Changes"
        okButtonProps={{
          style: { backgroundColor: '#C76A34', borderColor: '#C76A34' },
          loading: editLoading,
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: 'Name is required' },
              { min: 3, message: 'Name must be at least 3 characters' },
            ]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Username is required' },
              { min: 3, message: 'Username must be at least 3 characters' },
            ]}
          >
            <Input prefix="@" placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Role is required' }]}>
            <Select placeholder="Select role">
              {allRoleOptions.map((r) => (
                <Option key={r} value={r}>
                  <Tag color={roleColor[r] || 'purple'}>{r}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="New Password"
            help="Leave blank to keep the current password"
          >
            <Input.Password placeholder="Enter new password (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}

export default UsersManagementPage;
