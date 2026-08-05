import { useState } from 'react';
import {
  Button, Popconfirm, message, Alert,
  Typography, Space, Modal, Form, Input, Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRoles, createRole, updateRole as updateRoleApi, deleteRole,
} from '../api/queries';
import DashboardLayout from '../components/DashboardLayout';
import CustomCard from '../components/CustomCard';
import CustomTable from '../components/CustomTable';

const { Title } = Typography;

// Built-in roles that can't be deleted
const PROTECTED_ROLES = new Set(['Admin', 'Manager', 'Member']);

const roleTagColor = (name) => {
  const map = { Admin: 'red', Manager: 'orange', Member: 'blue' };
  return map[name] || 'purple';
};

function RoleManagementPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null); // null = create mode
  const [deletingId, setDeletingId] = useState(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const {
    data: rolesData = [],
    error,
    isLoading,
    refetch,
  } = useQuery({ queryKey: ['roles'], queryFn: fetchRoles });

  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      message.success('Role created successfully');
      setModalOpen(false);
      queryClient.invalidateQueries(['roles']);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || 'Failed to save role');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: updateRoleApi,
    onSuccess: () => {
      message.success('Role updated successfully');
      setModalOpen(false);
      queryClient.invalidateQueries(['roles']);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || 'Failed to save role');
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      message.success('Role deleted successfully');
      queryClient.invalidateQueries(['roles']);
      setDeletingId(null);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || 'Failed to delete role');
      setDeletingId(null);
    },
  });

  const roleList = rolesData;

  // ── Open modal ────────────────────────────────────────────
  const openCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    form.setFieldsValue({ name: role.name, description: role.description });
    setModalOpen(true);
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingRole) {
        updateRoleMutation.mutate({ id: editingRole._id, payload: values });
      } else {
        createRoleMutation.mutate(values);
      }
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || 'Failed to save role');
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = (roleId) => {
    setDeletingId(roleId);
    deleteRoleMutation.mutate(roleId);
  };

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Tag color={roleTagColor(name)} className="text-sm px-3 py-1">
          {name}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc) => (
        <span className="text-gray-500">{desc || <span className="italic text-gray-300">No description</span>}</span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) =>
        date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isProtected = PROTECTED_ROLES.has(record.name);
        return (
          <Space>
            <Button
              icon={<EditOutlined />}
              size="small"
              style={{ borderColor: '#C76A34', color: '#C76A34' }}
              onClick={() => openEdit(record)}
              disabled={isProtected}
              title={isProtected ? 'Built-in roles cannot be edited' : ''}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete Role"
              description={`Are you sure you want to delete "${record.name}"?`}
              onConfirm={() => handleDelete(record._id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              disabled={isProtected}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                loading={deletingId === record._id}
                disabled={isProtected}
                title={isProtected ? 'Built-in roles cannot be deleted' : ''}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const roleManagementStat = [
    { title: 'Total Roles', value: roleList.length },
    { title: 'Built-in Roles', value: roleList.filter((r) => PROTECTED_ROLES.has(r.name)).length },
    { title: 'Custom Roles', value: roleList.filter((r) => !PROTECTED_ROLES.has(r.name)).length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TagsOutlined className="text-[#C76A34] text-2xl" />
            <Title level={4} className="!text-[#2E2A27] !mb-0">Role Management</Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            style={{ backgroundColor: '#C76A34', borderColor: '#C76A34' }}
          >
            Add Role
          </Button>
        </div>

        {error && <Alert type="error" message={error} showIcon />}

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {roleManagementStat.map((stat) => (
            <CustomCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </div>

        {/* Roles Table */}
       <CustomTable
        title={`All Roles (${roleList.length})`}
        extraHeader={<Button onClick={refetch} size="small" loading={isLoading}>Refresh</Button>}
        isLoading={isLoading}
        dataSource={roleList}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />

      </div>

      {/* Create / Edit Role Modal */}
      <Modal
        title={
          <span className="text-[#2E2A27] font-semibold">
            {editingRole ? `Edit Role — ${editingRole.name}` : 'Create New Role'}
          </span>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editingRole ? 'Save Changes' : 'Create Role'}
        okButtonProps={{
          style: { backgroundColor: '#C76A34', borderColor: '#C76A34' },
          loading: createRoleMutation.isLoading || updateRoleMutation.isLoading,
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Role Name"
            rules={[
              { required: true, message: 'Role name is required' },
              { min: 2, message: 'Role name must be at least 2 characters' },
              { max: 50, message: 'Role name must be at most 50 characters' },
            ]}
          >
            <Input placeholder="e.g. Supervisor, Receptionist" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ max: 200, message: 'Description too long' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Brief description of what this role can do..."
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}

export default RoleManagementPage;
