import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Popconfirm, message, Skeleton, Alert,
  Typography, Space, Modal, Form, Input, Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import api from '../api/api';
import DashboardLayout from '../components/DashboardLayout';
import { useSelector, useDispatch } from 'react-redux';
import {
  setRoles, startRoleLoading, setRoleError, addRole, updateRole, removeRole,
} from '../store/slices/roleSlice';

const { Title } = Typography;

// Built-in roles that can't be deleted
const PROTECTED_ROLES = ['Admin', 'Manager', 'Member'];

const roleTagColor = (name) => {
  const map = { Admin: 'red', Manager: 'orange', Member: 'blue' };
  return map[name] || 'purple';
};

function RoleManagementPage() {
  const dispatch = useDispatch();
  const { roles = [], loading, error } = useSelector((state) => state.role);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null); // null = create mode
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form] = Form.useForm();

  const loadRoles = async () => {
    try {
      dispatch(startRoleLoading());
      const response = await api.get('/roles');
      dispatch(setRoles(response.data || []));
    } catch (err) {
      dispatch(setRoleError('Unable to load roles'));
    }
  };

  useEffect(() => {
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setSaving(true);

      if (editingRole) {
        // Update
        const response = await api.patch(`/roles/${editingRole._id}`, values);
        dispatch(updateRole(response.data.role));
        message.success('Role updated successfully');
      } else {
        // Create
        const response = await api.post('/roles', values);
        dispatch(addRole(response.data.role));
        message.success('Role created successfully');
      }
      setModalOpen(false);
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (roleId) => {
    try {
      setDeletingId(roleId);
      await api.delete(`/roles/${roleId}`);
      dispatch(removeRole(roleId));
      message.success('Role deleted successfully');
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to delete role');
    } finally {
      setDeletingId(null);
    }
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
        const isProtected = PROTECTED_ROLES.includes(record.name);
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
          <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm text-center">
            <div className="text-3xl font-bold text-[#C76A34]">{roles.length}</div>
            <div className="text-gray-500 mt-1">Total Roles</div>
          </Card>
          <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm text-center">
            <div className="text-3xl font-bold text-[#C76A34]">
              {roles.filter((r) => PROTECTED_ROLES.includes(r.name)).length}
            </div>
            <div className="text-gray-500 mt-1">Built-in Roles</div>
          </Card>
          <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm text-center">
            <div className="text-3xl font-bold text-[#C76A34]">
              {roles.filter((r) => !PROTECTED_ROLES.includes(r.name)).length}
            </div>
            <div className="text-gray-500 mt-1">Custom Roles</div>
          </Card>
        </div>

        {/* Roles Table */}
        <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-[#2E2A27]">All Roles ({roles.length})</span>
            <Button onClick={loadRoles} size="small" loading={loading}>Refresh</Button>
          </div>

          {loading && roles.length === 0 ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <Table
              rowKey="_id"
              dataSource={roles}
              columns={columns}
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
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
          loading: saving,
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
