import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Dropdown,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Skeleton,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import DashboardLayout from "../components/DashboardLayout";
import PermissionGate from "../components/PermissionGate";
import { usePermission } from "../hooks/usePermission";
import { fetchRoles, createRole, updateRole, deleteRole } from "../api/queries";
import { ROLE_COLORS } from "../constants/roleColors";

const { Title, Text } = Typography;
const { Option } = Select;

/* -------------------------------------------------------------------------- */
/*                              Module Configuration                          */
/* -------------------------------------------------------------------------- */

const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "users",     label: "User Management" },
  { key: "roles",     label: "Role Management" },
  { key: "bookings",  label: "Bookings" },
  { key: "approval",  label: "Booking Approval" },
  { key: "reports",   label: "Reports" },
  { key: "profile",   label: "Profile" },
];

const ACTIONS = [
  { key: "view",   label: "View" },
  { key: "create", label: "Create" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
];

/* -------------------------------------------------------------------------- */
/*                         Permission Helpers                                 */
/* -------------------------------------------------------------------------- */

const createEmptyPermissions = () => {
  return MODULES.map((module) => ({
    resource: module.key,
    action: {
      view: false,
      create: false,
      update: false,
      delete: false,
    },
  }));
};

const normalizePermissions = (permissions = []) => {
  return MODULES.map((module) => {
    const existing = permissions.find(
      (permission) => permission.resource === module.key
    );

    return {
      resource: module.key,
      action: {
        view: Boolean(existing?.action?.view),
        create: Boolean(existing?.action?.create),
        update: Boolean(existing?.action?.update),
        delete: Boolean(existing?.action?.delete),
      },
    };
  });
};

const updatePermission = (permissions, resource, action, checked) => {
  return permissions.map((permission) => {
    if (permission.resource !== resource) {
      return permission;
    }

    const updatedAction = {
      ...permission.action,
    };

    if (action === "view") {
      updatedAction.view = checked;

      if (!checked) {
        updatedAction.create = false;
        updatedAction.update = false;
        updatedAction.delete = false;
      }
    } else {
      if (!permission.action.view && checked) {
        message.warning(`Enable View permission for ${resource} first.`);
        return permission;
      }

      updatedAction[action] = checked;
    }

    return {
      ...permission,
      action: updatedAction,
    };
  });
};

/* -------------------------------------------------------------------------- */
/*                           Permission Matrix                                */
/* -------------------------------------------------------------------------- */

function PermissionMatrix({ permissions, setPermissions }) {
  const handlePermissionChange = (resource, action, checked) => {
    setPermissions((current) =>
      updatePermission(current, resource, action, checked)
    );
  };

  const columns = [
    {
      title: "Module",
      dataIndex: "resource",
      key: "resource",
      width: 180,
      render: (resource) => {
        const module = MODULES.find((item) => item.key === resource);
        return <Text strong className="text-xs">{module?.label || resource}</Text>;
      },
    },

    ...ACTIONS.map((action) => ({
      title: action.label,
      key: action.key,
      align: "center",
      width: 90,

      render: (_, record) => {
        const checked = Boolean(record.action?.[action.key]);
        const disabled = action.key !== "view" && !record.action?.view;

        return (
          <Checkbox
            checked={checked}
            disabled={disabled}
            onChange={(event) =>
              handlePermissionChange(
                record.resource,
                action.key,
                event.target.checked
              )
            }
          />
        );
      },
    })),
  ];

  return (
    <Table
      rowKey="resource"
      columns={columns}
      dataSource={permissions}
      pagination={false}
      bordered
      size="small"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                          Role Management Page                              */
/* -------------------------------------------------------------------------- */

function RoleManagementPage() {
  const permissionsHook = usePermission("roles");
  const canUpdate = permissionsHook.canUpdate;
  const canDelete = permissionsHook.canDelete;

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const [permissions, setPermissions] = useState(createEmptyPermissions());
  const [selectedManageableRoles, setSelectedManageableRoles] = useState([]);

  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  /* ---------------------------------------------------------------------- */
  /*                              Fetch Roles                               */
  /* ---------------------------------------------------------------------- */

  const {
    data: roles = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  /* ---------------------------------------------------------------------- */
  /*                              Mutations                                 */
  /* ---------------------------------------------------------------------- */

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      message.success("Role created successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      closeModal();
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || err?.message || "Failed to create role");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRole({ id, payload }),
    onSuccess: () => {
      message.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      closeModal();
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || err?.message || "Failed to update role");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      message.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || err?.message || "Failed to delete role");
    },
  });

  /* ---------------------------------------------------------------------- */
  /*                              Handlers                                  */
  /* ---------------------------------------------------------------------- */

  const openCreateModal = () => {
    setEditingRole(null);
    form.resetFields();
    form.setFieldsValue({
      color: "#722ed1",
      isDefault: false,
    });
    setPermissions(createEmptyPermissions());
    setSelectedManageableRoles([]);
    setModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description || "",
      color: role.color || "#722ed1",
      isDefault: Boolean(role.isDefault),
    });
    setPermissions(normalizePermissions(role.permissions));

    // Extract manageable role IDs
    const mRoleIds = (role.manageableRoles || []).map((r) =>
      typeof r === "object" ? r._id : r
    );
    setSelectedManageableRoles(mRoleIds);

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRole(null);
    form.resetFields();
    setPermissions(createEmptyPermissions());
    setSelectedManageableRoles([]);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const hasUserView = permissions.some(
        (p) => p.resource === "users" && p.action?.view
      );

      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || "",
        color: values.color || "#722ed1",
        isDefault: Boolean(values.isDefault),
        permissions,
        manageableRoles: hasUserView ? selectedManageableRoles : [],
      };

      if (editingRole) {
        updateMutation.mutate({ id: editingRole._id, payload });
      } else {
        createMutation.mutate(payload);
      }
    } catch {
      // form validation error
    }
  };

  const handleDelete = (role) => {
    if (role.isSystem) {
      message.warning("System roles cannot be deleted.");
      return;
    }
    deleteMutation.mutate(role._id);
  };

  const hasUserViewPermission = permissions.some(
    (p) => p.resource === "users" && p.action?.view
  );

  /* ---------------------------------------------------------------------- */
  /*                              Action Menu Builder                       */
  /* ---------------------------------------------------------------------- */

  const getActionMenuItems = (record) => {
    const items = [
      {
        key: "view",
        icon: <EyeOutlined />,
        label: "View Details",
        onClick: () => {
          setSelectedRole(record);
          setDetailsOpen(true);
        },
      },
    ];

    if (canUpdate) {
      items.push({
        key: "edit",
        icon: <EditOutlined />,
        label: "Edit Role",
        onClick: () => openEditModal(record),
      });
    }

    if (canDelete) {
      items.push({
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Delete Role",
        danger: true,
        disabled: record.isSystem,
        onClick: () => {
          if (record.isSystem) {
            message.warning("System roles cannot be deleted.");
            return;
          }
          Modal.confirm({
            title: "Delete Role",
            content: `Are you sure you want to delete ${record.name}?`,
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => handleDelete(record),
          });
        },
      });
    }

    return items;
  };

  /* ---------------------------------------------------------------------- */
  /*                              Role Columns                              */
  /* ---------------------------------------------------------------------- */

  const columns = [
    {
      title: "Role",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Space>
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: record.color || "#722ed1" }}
          />
          <Text strong>{name}</Text>
          {record.isSystem && <Tag color="gold">System</Tag>}
          {record.isDefault && <Tag color="green">Default</Tag>}
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description) => <Text type="secondary">{description || "-"}</Text>,
    },
    {
      title: "Permissions",
      key: "permissions",
      render: (_, record) => {
        const count =
          record.permissions?.filter((permission) => permission.action?.view).length || 0;
        return (
          <Tag color="blue">
            {count} module{count !== 1 ? "s" : ""}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={["click"]}>
          <Button icon={<MoreOutlined />}>
            Actions <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Dropdown>
      ),
    },
  ];

  /* ---------------------------------------------------------------------- */
  /*                              Loading / Error                           */
  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <DashboardLayout>
        <Skeleton active paragraph={{ rows: 6 }} />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <Alert
          type="error"
          showIcon
          message={error?.response?.data?.message || error?.message || "Unable to load roles"}
        />
      </DashboardLayout>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                                UI                                      */
  /* ---------------------------------------------------------------------- */

  return (
    <DashboardLayout>
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={3} className="!mb-1">
              Role Management
            </Title>
            <Text type="secondary">
              Create roles and control module permissions.
            </Text>
          </div>

          <PermissionGate resource="roles" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              style={{
                backgroundColor: "#C76A34",
                borderColor: "#C76A34",
              }}
            >
              Create Role
            </Button>
          </PermissionGate>
        </div>

        {/* Roles Table */}
        <Card>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={roles}
            pagination={{ pageSize: 8 }}
          />
        </Card>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*              Create / Edit Modal (Non-Scrollable)                */}
      {/* ---------------------------------------------------------------- */}

      <Modal
        title={editingRole ? `Edit Role — ${editingRole.name}` : "Create New Role"}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingRole ? "Save Changes" : "Create Role"}
        width={820}
        style={{ top: 20 }}
        destroyOnClose
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okButtonProps={{
          style: {
            backgroundColor: "#C76A34",
            borderColor: "#C76A34",
          },
        }}
      >
        <Form form={form} layout="vertical" className="mt-2 space-y-2">
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="name"
                label="Role Name"
                className="!mb-2"
                rules={[
                  { required: true, message: "Role name is required" },
                  { min: 2, message: "Minimum 2 characters" },
                ]}
              >
                <Input placeholder="Enter role name" disabled={editingRole?.isSystem} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="color"
                label="Badge Color"
                className="!mb-2"
                rules={[{ required: true, message: "Please select a color" }]}
              >
                <Select placeholder="Select color">
                  {ROLE_COLORS.map((c) => (
                    <Option key={c.value} value={c.value}>
                      <Space>
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: c.value }}
                        />
                        <span>{c.label}</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                name="isDefault"
                label="Default Role"
                className="!mb-2"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description" className="!mb-3">
            <Input placeholder="Describe role purpose (optional)" maxLength={150} />
          </Form.Item>

          <div className="mb-2">
            <Text strong className="text-sm">
              Module Permissions
            </Text>
            <Text type="secondary" className="block text-xs">
              View permission is required before Create, Update, or Delete can be assigned.
            </Text>
          </div>

          <PermissionMatrix
            permissions={permissions}
            setPermissions={setPermissions}
          />

          {/* User Management Role Access (Visible when users.view === true) */}
          {hasUserViewPermission && (
            <div className="mt-3 p-3 bg-gray-50 border rounded-lg">
              <Text strong className="text-sm block mb-1 text-[#2E2A27]">
                User Management Role Access
              </Text>
              <Text type="secondary" className="block text-xs mb-2">
                Select which user roles this role is authorized to view and manage in User Management.
              </Text>

              <Row gutter={[12, 8]}>
                {roles.map((r) => {
                  const isChecked = selectedManageableRoles.includes(r._id);
                  return (
                    <Col key={r._id} span={6}>
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedManageableRoles((prev) => [...prev, r._id]);
                          } else {
                            setSelectedManageableRoles((prev) =>
                              prev.filter((id) => id !== r._id)
                            );
                          }
                        }}
                      >
                        <Space size={4}>
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: r.color || "#722ed1" }}
                          />
                          <span className="text-xs font-medium">{r.name}</span>
                        </Space>
                      </Checkbox>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}
        </Form>
      </Modal>

      {/* ---------------------------------------------------------------- */}
      {/*                         Role Details Modal                        */}
      {/* ---------------------------------------------------------------- */}

      <Modal
        title={selectedRole ? `Role Details — ${selectedRole.name}` : "Role Details"}
        open={detailsOpen}
        onCancel={() => {
          setDetailsOpen(false);
          setSelectedRole(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailsOpen(false);
              setSelectedRole(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={820}
        style={{ top: 30 }}
      >
        {selectedRole && (
          <>
            <div className="mb-4">
              <Space wrap>
                <Tag color={selectedRole.color || "#722ed1"}>
                  {selectedRole.name}
                </Tag>
                {selectedRole.isSystem && <Tag color="gold">System Role</Tag>}
                {selectedRole.isDefault && <Tag color="green">Default Role</Tag>}
              </Space>

              <div className="mt-2">
                <Text type="secondary">{selectedRole.description || "No description provided."}</Text>
              </div>

              {selectedRole.manageableRoles && selectedRole.manageableRoles.length > 0 && (
                <div className="mt-3">
                  <Text strong className="text-xs block mb-1">
                    Manageable User Roles:
                  </Text>
                  <Space wrap size={4}>
                    {selectedRole.manageableRoles.map((mr) => {
                      const name = typeof mr === "object" ? mr.name : mr;
                      const color = typeof mr === "object" ? mr.color : "#722ed1";
                      return (
                        <Tag key={typeof mr === "object" ? mr._id : mr} color={color}>
                          {name}
                        </Tag>
                      );
                    })}
                  </Space>
                </div>
              )}
            </div>

            <Table
              rowKey="resource"
              pagination={false}
              bordered
              size="small"
              columns={[
                {
                  title: "Module",
                  dataIndex: "resource",
                  width: 180,
                  render: (resource) => {
                    const module = MODULES.find((item) => item.key === resource);
                    return <Text strong className="text-xs">{module?.label || resource}</Text>;
                  },
                },
                ...ACTIONS.map((action) => ({
                  title: action.label,
                  align: "center",
                  width: 90,
                  render: (_, record) => (
                    <Checkbox
                      checked={Boolean(record.action?.[action.key])}
                      disabled
                    />
                  ),
                })),
              ]}
              dataSource={normalizePermissions(selectedRole.permissions)}
            />
          </>
        )}
      </Modal>
    </DashboardLayout>
  );
}

export default RoleManagementPage;