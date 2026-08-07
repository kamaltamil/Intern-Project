import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Button, Tag, Space, Typography, Divider,
  Modal, Form, Input, Drawer, Checkbox,
  Descriptions, Badge, message, Popconfirm, Alert, Select,
} from 'antd';
import {
  PlusOutlined, SettingOutlined, CheckOutlined,
  InfoCircleOutlined, TagsOutlined,
  CheckCircleFilled, MinusCircleFilled,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRoles, createRole, deleteRole, assignPermissions } from '../api/queries';
import DashboardLayout from '../components/DashboardLayout';
import CustomCard from '../components/CustomCard';
import CustomTable from '../components/CustomTable';

const { Title, Text } = Typography;

const PROTECTED_ROLES = new Set(['Admin', 'Manager', 'Member']);

// Preset color options for unique role tag colors
const COLOR_OPTIONS = [
  { label: 'Purple',   value: '#722ed1' },
  { label: 'Red',      value: '#f5222d' },
  { label: 'Orange',   value: '#fa8c16' },
  { label: 'Blue',     value: '#1890ff' },
  { label: 'Green',    value: '#52c41a' },
  { label: 'Cyan',     value: '#13c2c2' },
  { label: 'Pink',     value: '#eb2f96' },
  { label: 'Geekblue', value: '#2f54eb' },
  { label: 'Gold',     value: '#faad14' },
];

// Display labels for resources — if a resource isn't listed here, the raw name is shown
const RESOURCE_LABEL = {
  dashboard: 'Dashboard',
  users:     'User Management',
  roles:     'Role Management',
  bookings:  'Bookings',
  approval:  'Booking Approval',
  reports:   'Reports',
  profile:   'Profile',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Build { resource: { view: false, create: false, ... } } state for a given permission array
function buildPermState(dbPermissions, modules, actions) {
  const state = {};
  modules.forEach(({ resource }) => {
    const found = dbPermissions.find(p => p.resource === resource);
    const obj = {};
    actions.forEach(a => { obj[a] = found?.action?.[a] || false; });
    state[resource] = obj;
  });
  return state;
}

// Convert state back to the API payload format
function stateToPayload(state) {
  return Object.entries(state).map(([resource, action]) => ({ resource, action }));
}

// ── Editable permission grid ─────────────────────────────────────────────────
function PermissionGrid({ modules, actions, permState, onToggle, onModuleAll, onActionAll }) {
  if (!modules.length || !actions.length) return null;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#374151', minWidth: 150 }}>
              Module
            </th>
            {actions.map(action => (
              <th key={action} style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 600, color: '#374151', textTransform: 'capitalize', minWidth: 72 }}>
                <div style={{ fontSize: 12 }}>{action}</div>
                <Button
                  type="link"
                  size="small"
                  style={{ fontSize: 11, padding: 0, color: '#6366f1' }}
                  onClick={() => onActionAll(action)}
                >
                  {modules.every(m => permState[m.resource]?.[action]) ? 'None' : 'All'}
                </Button>
              </th>
            ))}
            <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 600, color: '#374151', minWidth: 48 }}>
              All
            </th>
          </tr>
        </thead>
        <tbody>
          {modules.map(({ resource, label }, idx) => {
            const current = permState[resource] || {};
            const allChecked = actions.every(a => current[a]);
            const anyChecked = actions.some(a => current[a]);
            return (
              <tr key={resource} style={{ backgroundColor: idx % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '9px 12px', fontWeight: 500, fontSize: 13, color: '#374151' }}>{label}</td>
                {actions.map(action => (
                  <td key={action} style={{ textAlign: 'center', padding: '9px 8px' }}>
                    <Checkbox
                      checked={current[action] || false}
                      onChange={() => onToggle(resource, action)}
                    />
                  </td>
                ))}
                <td style={{ textAlign: 'center', padding: '9px 8px' }}>
                  <Checkbox
                    checked={allChecked}
                    indeterminate={!allChecked && anyChecked}
                    onChange={() => onModuleAll(resource)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Read-only permission table for Details drawer ────────────────────────────
function PermissionReadOnly({ dbPermissions, modules, actions }) {
  if (!modules.length || !actions.length) return <Text type="secondary">No permissions configured.</Text>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#374151', minWidth: 150, fontSize: 13 }}>
              Module
            </th>
            {actions.map(action => (
              <th key={action} style={{ textAlign: 'center', padding: '8px 8px', fontWeight: 600, color: '#374151', textTransform: 'capitalize', minWidth: 72, fontSize: 12 }}>
                {action}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {modules.map(({ resource, label }, idx) => {
            const perm = dbPermissions.find(p => p.resource === resource);
            const hasAny = perm && actions.some(a => perm.action?.[a]);
            return (
              <tr key={resource} style={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: hasAny ? 600 : 400, color: hasAny ? '#111827' : '#9ca3af' }}>
                  {label}
                </td>
                {actions.map(action => {
                  const granted = perm?.action?.[action] === true;
                  return (
                    <td key={action} style={{ textAlign: 'center', padding: '8px 8px' }}>
                      {granted
                        ? <CheckCircleFilled style={{ color: '#22c55e', fontSize: 15 }} />
                        : <MinusCircleFilled style={{ color: '#e5e7eb', fontSize: 15 }} />
                      }
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
function RoleManagementPage() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { theme } = useSelector((state) => state.auth);
  const isDark = theme === "dark";

  // Create modal
  const [createOpen, setCreateOpen]           = useState(false);
  const [createPermState, setCreatePermState] = useState({});

  // Permissions drawer (edit)
  const [permDrawerOpen, setPermDrawerOpen] = useState(false);
  const [permRole, setPermRole]             = useState(null);
  const [permState, setPermState]           = useState({});

  // Details drawer
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsRole, setDetailsRole] = useState(null);

  const { data: roles = [], isLoading, error, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });

  // Derive modules and actions from DB data — no hardcoding
  const referencePerms = roles.find(r => r.permissions?.length > 0)?.permissions || [];
  const modules = referencePerms.map(p => ({
    resource: p.resource,
    label: RESOURCE_LABEL[p.resource] || p.resource,
  }));
  const actions = referencePerms.length > 0 ? Object.keys(referencePerms[0].action || {}) : [];

  // ── Mutations ────────────────────────────────────────────────
  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => { message.success('Role created'); setCreateOpen(false); queryClient.invalidateQueries(['roles']); },
    onError: err => message.error(err?.response?.data?.message || 'Failed to create role'),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => { message.success('Role deleted'); queryClient.invalidateQueries(['roles']); },
    onError: err => message.error(err?.response?.data?.message || 'Failed to delete role'),
  });

  const assignPermsMutation = useMutation({
    mutationFn: assignPermissions,
    onSuccess: () => { message.success('Permissions saved'); setPermDrawerOpen(false); queryClient.invalidateQueries(['roles']); },
    onError: err => message.error(err?.response?.data?.message || 'Failed to save permissions'),
  });

   const handleDeleteClick = (record) => {
    Modal.confirm({
      title: "Delete Role",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Are you sure you want to delete ${record.role}?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => deleteRoleMutation.mutate(record._id),
    });
  };
  // ── Create modal ─────────────────────────────────────────────
  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ color: '#722ed1' });
    setCreatePermState(buildPermState([], modules, actions));
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      createRoleMutation.mutate({ ...values, permissions: stateToPayload(createPermState) });
    } catch { /* antd handles field errors */ }
  };

  const handleCreateToggle = (resource, action) =>
    setCreatePermState(prev => ({ ...prev, [resource]: { ...prev[resource], [action]: !prev[resource][action] } }));

  const handleCreateModuleAll = (resource) => {
    const allChecked = actions.every(a => createPermState[resource]?.[a]);
    setCreatePermState(prev => ({ ...prev, [resource]: Object.fromEntries(actions.map(a => [a, !allChecked])) }));
  };

  const handleCreateActionAll = (action) => {
    const allChecked = modules.every(m => createPermState[m.resource]?.[action]);
    setCreatePermState(prev => {
      const next = { ...prev };
      modules.forEach(({ resource }) => { next[resource] = { ...next[resource], [action]: !allChecked }; });
      return next;
    });
  };

  // ── Permissions drawer ───────────────────────────────────────
  const openPermissions = (role) => {
    setPermRole(role);
    setPermState(buildPermState(role.permissions || [], modules, actions));
    setPermDrawerOpen(true);
  };

  const handlePermToggle = (resource, action) =>
    setPermState(prev => ({ ...prev, [resource]: { ...prev[resource], [action]: !prev[resource][action] } }));

  const handlePermModuleAll = (resource) => {
    const allChecked = actions.every(a => permState[resource]?.[a]);
    setPermState(prev => ({ ...prev, [resource]: Object.fromEntries(actions.map(a => [a, !allChecked])) }));
  };

  const handlePermActionAll = (action) => {
    const allChecked = modules.every(m => permState[m.resource]?.[action]);
    setPermState(prev => {
      const next = { ...prev };
      modules.forEach(({ resource }) => { next[resource] = { ...next[resource], [action]: !allChecked }; });
      return next;
    });
  };

  const handleSavePermissions = () => {
    assignPermsMutation.mutate({ id: permRole._id, permissions: stateToPayload(permState) });
  };

  // ── Table columns ────────────────────────────────────────────
  const columns = [
    {
      title: 'Role Name',
      key: 'name',
      render: (_, record) => (
        <Tag color={record.color || 'purple'} style={{ fontSize: 13, padding: '2px 10px' }}>
          {record.name}
        </Tag>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, r) => PROTECTED_ROLES.has(r.name)
        ? <Badge status="processing" text={<Text style={{ fontSize: 12 }}>Built-in</Text>} />
        : <Badge status="success"    text={<Text style={{ fontSize: 12 }}>Custom</Text>} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isBuiltIn = PROTECTED_ROLES.has(record.name);
        return (
          <Space size={6}>
            <Button size="small" icon={<InfoCircleOutlined />} onClick={() => { setDetailsRole(record); setDetailsOpen(true); }}>
              Details
            </Button>
            <Button size="small" icon={<SettingOutlined />} style={{ borderColor: '#6366f1', color: '#6366f1' }} onClick={() => openPermissions(record)}>
              Permissions
            </Button>
             {!isBuiltIn && (
              <Button
                size="small"
                onClick={() => handleDeleteClick(record)}
                danger
                icon={<DeleteOutlined />}
              >
                Delete
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  const stats = [
    { title: 'Total Roles',  value: roles.length },
    { title: 'Built-in',     value: roles.filter(r => PROTECTED_ROLES.has(r.name)).length },
    { title: 'Custom Roles', value: roles.filter(r => !PROTECTED_ROLES.has(r.name)).length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TagsOutlined className="text-[#C76A34] text-2xl" />
            <Title level={4} className="!mb-0" style={{ color: isDark ? "#f0f0f0" : "#2E2A27" }}>Role Management</Title>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
            style={{ backgroundColor: '#C76A34', borderColor: '#C76A34' }}>
            Add Role
          </Button>
        </div>

        {error && <Alert type="error" message={String(error)} showIcon />}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map(s => <CustomCard key={s.title} title={s.title} value={s.value} />)}
        </div>

        {/* Table */}
        <CustomTable
          title={`All Roles (${roles.length})`}
          extraHeader={<Button size="small" loading={isLoading} onClick={refetch}>Refresh</Button>}
          isLoading={isLoading}
          dataSource={roles}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* ── Create Role Modal ─────────────────────────────────── */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined style={{ color: '#C76A34' }} />
            <span className="font-semibold text-[#2E2A27]">Create New Role</span>
          </div>
        }
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText="Create Role"
        okButtonProps={{
          style: { backgroundColor: '#C76A34', borderColor: '#C76A34' },
          loading: createRoleMutation.isPending,
        }}
        centered
        width={680}
        styles={{ body: { maxHeight: '72vh', overflowY: 'auto', paddingTop: 8 } }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
            <Form.Item
              name="name" label="Role Name"
              rules={[
                { required: true, message: 'Role name is required' },
                { min: 2, message: 'At least 2 characters' },
                { max: 50, message: 'At most 50 characters' },
              ]}
            >
              <Input placeholder="e.g. Supervisor" />
            </Form.Item>

            <Form.Item
              name="color" label="Badge Color"
              rules={[{ required: true, message: 'Color is required' }]}
            >
              <Select
                options={COLOR_OPTIONS.map(c => ({
                  label: (
                    <div className="flex items-center gap-2">
                      <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: c.value, display: 'inline-block' }} />
                      <span>{c.label}</span>
                    </div>
                  ),
                  value: c.value,
                }))}
              />
            </Form.Item>

            <Form.Item name="description" label="Description" rules={[{ max: 200 }]}>
              <Input placeholder="Brief description..." />
            </Form.Item>
          </div>

          <Divider style={{ margin: '4px 0 12px' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>Module Permissions</span>
          </Divider>

          <PermissionGrid
            modules={modules}
            actions={actions}
            permState={createPermState}
            onToggle={handleCreateToggle}
            onModuleAll={handleCreateModuleAll}
            onActionAll={handleCreateActionAll}
          />
        </Form>
      </Modal>

      {/* ── Permissions Drawer ────────────────────────────────── */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <SettingOutlined style={{ color: '#6366f1' }} />
            <span className="font-semibold">Permissions —</span>
            <Tag color={permRole?.color || 'purple'}>{permRole?.name}</Tag>
          </div>
        }
        open={permDrawerOpen}
        onClose={() => setPermDrawerOpen(false)}
        width={580}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setPermDrawerOpen(false)}>Cancel</Button>
            <Button
              type="primary" icon={<CheckOutlined />}
              loading={assignPermsMutation.isPending}
              onClick={handleSavePermissions}
              style={{ backgroundColor: '#6366f1', borderColor: '#6366f1' }}
            >
              Save
            </Button>
          </div>
        }
      >
        {permRole && (
          <PermissionGrid
            modules={modules}
            actions={actions}
            permState={permState}
            onToggle={handlePermToggle}
            onModuleAll={handlePermModuleAll}
            onActionAll={handlePermActionAll}
          />
        )}
      </Drawer>

      {/* ── Details Drawer ────────────────────────────────────── */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <InfoCircleOutlined style={{ color: '#C76A34' }} />
            <span className="font-semibold">Role Details</span>
          </div>
        }
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        width={620}
        footer={<div className="flex justify-end"><Button onClick={() => setDetailsOpen(false)}>Close</Button></div>}
      >
        {detailsRole && (
          <div className="space-y-6">
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Role Name">
                <Tag color={detailsRole.color || 'purple'} style={{ fontSize: 13, padding: '2px 10px' }}>
                  {detailsRole.name}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                {PROTECTED_ROLES.has(detailsRole.name)
                  ? <Badge status="processing" text="Built-in" />
                  : <Badge status="success" text="Custom" />
                }
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {detailsRole.description || <Text type="secondary">No description</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Created">{formatDate(detailsRole.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Last Updated">{formatDate(detailsRole.updatedAt)}</Descriptions.Item>
            </Descriptions>

            <div>
              <Title level={5} style={{ marginBottom: 12, color: isDark ? "#f0f0f0" : '#374151' }}>Module Permissions</Title>
              <PermissionReadOnly
                dbPermissions={detailsRole.permissions || []}
                modules={modules}
                actions={actions}
              />
            </div>
          </div>
        )}
      </Drawer>
    </DashboardLayout>
  );
}

export default RoleManagementPage;