import { useState } from "react";
import {
  Alert,
  Button,
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
import { useSelector } from "react-redux";

import PermissionGate from "../components/PermissionGate";
import { usePermission } from "../hooks/usePermission";
import { fetchRoles, createRole, updateRole, deleteRole } from "../api/queries";
import { ROLE_COLORS } from "../constants/roleColors";
import CustomTable from "../components/CustomTable";

const { Title, Text } = Typography;
const { Option } = Select;

const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "users", label: "User Management" },
  { key: "roles", label: "Role Management" },
  { key: "bookings", label: "Bookings" },
  { key: "approval", label: "Booking Approval" },
  { key: "reports", label: "Reports" },
  { key: "profile", label: "Profile" },
  { key: "rooms", label: "Room Management" },
];

const ACTIONS = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
];

const createEmptyPermissions = () =>
  MODULES.map(({ key }) => ({
    resource: key,
    action: { view: false, create: false, update: false, delete: false },
  }));

const normalizePermissions = (permissions = []) =>
  MODULES.map(({ key }) => {
    const current = permissions.find(
      (permission) => permission.resource === key,
    );
    return {
      resource: key,
      action: {
        view: Boolean(current?.action?.view),
        create: Boolean(current?.action?.create),
        update: Boolean(current?.action?.update),
        delete: Boolean(current?.action?.delete),
      },
    };
  });

const updatePermission = (permissions, resource, action, checked) =>
  permissions.map((permission) => {
    if (permission.resource !== resource) return permission;

    const nextAction = { ...permission.action };

    if (action === "view") {
      nextAction.view = checked;
      if (!checked) {
        nextAction.create = false;
        nextAction.update = false;
        nextAction.delete = false;
      }
    } else {
      if (checked && !permission.action.view) {
        message.warning(`Enable View permission for ${resource} first.`);
        return permission;
      }
      nextAction[action] = checked;
    }

    return { ...permission, action: nextAction };
  });

const setAllPermissions = (permissions, resource, checked) =>
  permissions.map((permission) =>
    permission.resource === resource
      ? {
          ...permission,
          action: {
            view: checked,
            create: checked,
            update: checked,
            delete: checked,
          },
        }
      : permission,
  );

function PermissionMatrix({ permissions, setPermissions }) {
  const handleChange = (resource, action, checked) => {
    setPermissions((current) =>
      action === "all"
        ? setAllPermissions(current, resource, checked)
        : updatePermission(current, resource, action, checked),
    );
  };

  const columns = [
    {
      title: "Module",
      dataIndex: "resource",
      width: 180,
      render: (resource) => (
        <Text strong className="text-xs">
          {MODULES.find((module) => module.key === resource)?.label || resource}
        </Text>
      ),
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
              handleChange(record.resource, action.key, event.target.checked)
            }
          />
        );
      },
    })),
    {
      title: "All",
      key: "all",
      align: "center",
      width: 90,
      render: (_, record) => {
        const allSelected = ACTIONS.every(
          (action) => record.action?.[action.key] === true,
        );
        return (
          <Checkbox
            checked={allSelected}
            onChange={(event) =>
              handleChange(record.resource, "all", event.target.checked)
            }
          />
        );
      },
    },
  ];

  return (
    <CustomTable
      rowKey="resource"
      columns={columns}
      dataSource={permissions}
      pagination={false}
      bordered
      size="small"
    />
  );
}

function RoleManagementPage() {
  const { canUpdate, canDelete } = usePermission("roles");
  const { theme } = useSelector((state) => state.auth);
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState(createEmptyPermissions());
  const [selectedManageableRoles, setSelectedManageableRoles] = useState([]);

  const {
    data: roles = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingRole(null);
    form.resetFields();
    setPermissions(createEmptyPermissions());
    setSelectedManageableRoles([]);
  };

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      message.success("Role created successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      closeModal();
    },
    onError: (err) =>
      message.error(err?.response?.data?.message || "Failed to create role"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRole({ id, payload }),
    onSuccess: () => {
      message.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["current-user-permissions"] });
      closeModal();
    },
    onError: (err) =>
      message.error(err?.response?.data?.message || "Failed to update role"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      message.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err) =>
      message.error(err?.response?.data?.message || "Failed to delete role"),
  });

  const openCreateModal = () => {
    setEditingRole(null);
    form.resetFields();
    form.setFieldsValue({ color: "#722ed1", isDefault: false });
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
    setSelectedManageableRoles(
      (role.manageableRoles || []).map((item) =>
        typeof item === "object" ? item._id : item,
      ),
    );
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const hasUserView = permissions.some(
        (permission) =>
          permission.resource === "users" && permission.action?.view === true,
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
      // antd displays validation errors
    }
  };

  const actionItems = (record) => {
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
          if (record.isSystem) return;
          Modal.confirm({
            title: "Delete Role",
            content: `Are you sure you want to delete ${record.name}?`,
            okType: "danger",
            onOk: () => deleteMutation.mutate(record._id),
          });
        },
      });
    }

    return items;
  };

  const columns = [
    {
      title: "Role",
      dataIndex: "name",
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
      render: (value) => <Text type="secondary">{value || "-"}</Text>,
    },
    {
      title: "Permissions",
      render: (_, record) => {
        const count =
          record.permissions?.filter((permission) => permission.action?.view)
            .length || 0;
        return <Tag color="blue">{count} modules</Tag>;
      },
    },
    {
      title: "Actions",
      width: 130,
      render: (_, record) => (
        <Dropdown menu={{ items: actionItems(record) }} trigger={["click"]}>
          <Button icon={<MoreOutlined />}>
            Actions <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Dropdown>
      ),
    },
  ];

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message={error?.response?.data?.message || "Unable to load roles"}
      />
    );
  }

  const hasUserViewPermission = permissions.some(
    (permission) =>
      permission.resource === "users" && permission.action?.view === true,
  );

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <Title
            level={3}
            className="!mb-1"
            style={{ color: isDark ? "#f0f0f0" : "#2E2A27" }}
          >
            Role Management
          </Title>
          <Text className="text-gray-400 text-sm">
            Create roles and control module permissions.
          </Text>
        </div>

        <PermissionGate resource="roles" action="create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            style={{ backgroundColor: "#C76A34", borderColor: "#C76A34" }}
          >
            Create Role
          </Button>
        </PermissionGate>
      </div>

      <CustomTable
        rowKey="_id"
        columns={columns}
        dataSource={roles}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={
          editingRole ? `Edit Role — ${editingRole.name}` : "Create New Role"
        }
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingRole ? "Save Changes" : "Create Role"}
        width={900}
        style={{ top: 20 }}
        destroyOnHidden
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okButtonProps={{
          style: { backgroundColor: "#C76A34", borderColor: "#C76A34" },
        }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Form.Item
                name="name"
                label="Role Name"
                rules={[{ required: true, message: "Role name is required" }]}
              >
                <Input disabled={editingRole?.isSystem} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="color"
                label="Badge Color"
                rules={[{ required: true }]}
              >
                <Select>
                  {ROLE_COLORS.map((color) => (
                    <Option key={color.value} value={color.value}>
                      <Space>
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="isDefault"
                label="Default Role"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input
              placeholder="Describe role purpose (optional)"
              maxLength={150}
            />
          </Form.Item>

          <div className="mb-2">
            <Text strong>Module Permissions</Text>
            <Text type="secondary" className="block text-xs">
              Create, Update, and Delete require View. The All checkbox enables
              all four actions.
            </Text>
          </div>

          <PermissionMatrix
            permissions={permissions}
            setPermissions={setPermissions}
          />

          {hasUserViewPermission && (
            <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
              <Text strong className="block mb-1">
                User Management Role Access
              </Text>
              <Text type="secondary" className="block text-xs mb-3">
                Select which roles this role can manage.
              </Text>
              <Row gutter={[12, 8]}>
                {roles.map((role) => {
                  const checked = selectedManageableRoles.includes(role._id);
                  return (
                    <Col xs={24} sm={12} md={8} key={role._id}>
                      <Checkbox
                        checked={checked}
                        onChange={(event) =>
                          setSelectedManageableRoles((current) =>
                            event.target.checked
                              ? [...new Set([...current, role._id])]
                              : current.filter((id) => id !== role._id),
                          )
                        }
                      >
                        <Space size={4}>
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: role.color || "#722ed1" }}
                          />
                          {role.name}
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

      <Modal
        title={
          selectedRole ? `Role Details — ${selectedRole.name}` : "Role Details"
        }
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
        width={900}
      >
        {selectedRole && (
          <div className="space-y-4">
            <div>
              <Space wrap>
                <Tag color={selectedRole.color || "#722ed1"}>
                  {selectedRole.name}
                </Tag>
                {selectedRole.isSystem && <Tag color="gold">System Role</Tag>}
                {selectedRole.isDefault && (
                  <Tag color="green">Default Role</Tag>
                )}
              </Space>
              <Text type="secondary" className="block mt-2">
                {selectedRole.description || "No description provided."}
              </Text>
            </div>

            {selectedRole.manageableRoles?.length > 0 && (
              <div>
                <Text strong className="block mb-2">
                  Manageable User Roles
                </Text>
                <Space wrap>
                  {selectedRole.manageableRoles.map((role) => (
                    <Tag
                      key={typeof role === "object" ? role._id : role}
                      color={typeof role === "object" ? role.color : "#722ed1"}
                    >
                      {typeof role === "object" ? role.name : role}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            <Table
              rowKey="resource"
              pagination={false}
              bordered
              size="small"
              columns={[
                {
                  title: "Module",
                  dataIndex: "resource",
                  render: (resource) =>
                    MODULES.find((module) => module.key === resource)?.label ||
                    resource,
                },
                ...ACTIONS.map((action) => ({
                  title: action.label,
                  align: "center",
                  render: (_, record) => (
                    <Checkbox
                      checked={Boolean(record.action?.[action.key])}
                      disabled
                    />
                  ),
                })),
                {
                  title: "All",
                  align: "center",
                  render: (_, record) => (
                    <Checkbox
                      checked={ACTIONS.every(
                        (action) => record.action?.[action.key] === true,
                      )}
                      disabled
                    />
                  ),
                },
              ]}
              dataSource={normalizePermissions(selectedRole.permissions)}
            />
          </div>
        )}
      </Modal>
    </section>
  );
}

export default RoleManagementPage;
