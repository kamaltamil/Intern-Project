import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Tag,
  Popconfirm,
  message,
  Skeleton,
  Alert,
  Typography,
  Space,
  Modal,
  Form,
  Avatar,
  Row,
  Col,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomCard from "../components/CustomCard";
import CustomTable from "../components/CustomTable";
import PermissionGate from "../components/PermissionGate";

import {
  fetchUsers,
  fetchRoles,
  updateUser as updateUserApi,
  deleteUser,
  createUser,
} from "../api/queries";

import { resolveProfileImage } from "../utils/image";
import { usePermission } from "../hooks/usePermission";
import { ROLE_COLORS } from "../constants/roleColors";
import CustomForm from "../components/CustomForm";

const { Title, Text } = Typography;

const getFallbackRoleColor = (roleName) => {
  const match = ROLE_COLORS.find(
    (c) => c.label.toLowerCase() === roleName?.toLowerCase(),
  );
  return match ? match.value : "#722ed1";
};

/* -------------------------------------------------------------------------- */
/*                         Users Management Page                              */
/* -------------------------------------------------------------------------- */

function UsersManagementPage() {
  const queryClient = useQueryClient();
  const { theme } = useSelector((state) => state.auth);
  const isDark = theme === "dark";

  /* ---------- RBAC Permissions ---------- */
  const canCreate = usePermission("users", "create");

  /* ---------- Local State ---------- */
  const [updatingId, setUpdatingId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();

  /* ---------- Fetch Users (Primary Data Source) ---------- */
  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersError,
    error: usersQueryError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  /* ---------- Fetch Roles (LAZY: ONLY when Add/Edit Modal opens) ---------- */
  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    enabled: editModalOpen || addModalOpen,
  });

  /* ---------- Update User ---------- */
  const updateUserMutation = useMutation({
    mutationFn: updateUserApi,

    onSuccess: () => {
      message.success("User updated successfully");
      setEditModalOpen(false);
      setEditingUser(null);
      editForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    onError: (error) => {
      message.error(error?.response?.data?.message || "Failed to update user");
    },
  });

  /* ---------- Create User (Admin) ---------- */
  const createUserMutation = useMutation({
    mutationFn: createUser,

    onSuccess: () => {
      message.success("User created successfully");
      setAddModalOpen(false);
      addForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    onError: (error) => {
      message.error(error?.response?.data?.message || "Unable to create user");
    },
  });

  /* ---------- Delete User ---------- */
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,

    onSuccess: () => {
      message.success("User deleted successfully");
      setUpdatingId(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    onError: (error) => {
      setUpdatingId(null);
      message.error(error?.response?.data?.message || "Failed to delete user");
    },
  });

  /* ---------- Open Edit Modal ---------- */
  const openEditModal = (record) => {
    setEditingUser(record);

    const roleVal =
      typeof record.role === "object" ? record.role?._id : record.role;

    editForm.setFieldsValue({
      name: record.name,
      email: record.email,
      username: record.username,
      role: roleVal,
      isActive: record.isActive,
      password: '',
    });

    setEditModalOpen(true);
  };

  /* ---------- Update Handler ---------- */
  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      updateUserMutation.mutate({
        id: editingUser._id,
        payload: values,
      });
    } catch {
      // antd handles validation display
    }
  };

  /* ---------- Create User ---------- */
  const handleAddUser = async () => {
    try {
      const values = await addForm.validateFields();
      createUserMutation.mutate({
        name: values.name,
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
      });
    } catch {
      // antd handles validation display
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = (id) => {
    setUpdatingId(id);
    deleteUserMutation.mutate(id);
  };

  /* ---------- Table Columns ---------- */
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (name, record) => (
        <div className="flex items-center gap-3" >
          <Avatar
            src={resolveProfileImage(record.profileImage)}
            style={{ backgroundColor: "#C76A34" }}
          >
            {!record.profileImage &&
              (record.name?.charAt(0)?.toUpperCase() || "U")}
          </Avatar>
          <span className="font-medium" >{name}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Username",
      dataIndex: "username",
      render: (username) => <span className="text-gray-500" >@{username}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => {
        const roleName = typeof role === "object" ? role?.name : role;
        const color =
          typeof role === "object" && role?.color
            ? role.color
            : getFallbackRoleColor(roleName);
        return <Tag color={color}>{roleName || "—"}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small" >
          <PermissionGate resource="users" action="update" >
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              style={{ color: "#C76A34", borderColor: "#C76A34" }}
            >
              Edit
            </Button>
          </PermissionGate>

          <PermissionGate resource="users" action="delete" >
            <Popconfirm
              title="Delete User"
              description={`Are you sure you want to delete ${record.name}?`}
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={updatingId === record._id}
              >
                Delete
              </Button>
            </Popconfirm>
          </PermissionGate>
        </Space>
      ),
    },
  ];

  /* ---------- Safe Users Array ---------- */
  const safeUsers = Array.isArray(users) ? users : [];

  /* ---------- Stat Computations ---------- */
  const getRoleName = (r) => (typeof r === "object" ? r?.name : r) || "";

  const totalAdmins = safeUsers.filter(
    (u) => getRoleName(u.role) === "Admin",
  ).length;

  const totalManagers = safeUsers.filter(
    (u) => getRoleName(u.role) === "Manager",
  ).length;

  const totalMembers = safeUsers.filter(
    (u) => getRoleName(u.role) === "Member",
  ).length;

  const userStats = [
    { title: "Total Users", value: safeUsers.length, icon: <TeamOutlined /> },
    { title: "Admins", value: totalAdmins, icon: <CrownOutlined /> },
    { title: "Managers", value: totalManagers, icon: <UserOutlined /> },
    { title: "Members", value: totalMembers, icon: <UserOutlined /> },
  ];

  /* ---------- Loading State ---------- */
  if (usersLoading) {
    return (
      <div className="space-y-4" >
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  /* ---------- Error State ---------- */
  if (usersError) {
    return (
      <Alert
        type="error"
        showIcon
        message={usersQueryError?.message || "Unable to fetch users list."}
      />
    );
  }

  const addFormData = [
    {
      type: "input",
      name: "name",
      label: "Full Name",
      rules: [
        { required: true, message: "Please enter your full name" },
        {
          pattern: String.raw`^([a-zA-Z]{2,}(?:\s[a-zA-Z]{2,})+)$`,
          message: "Please enter full name (only alphabets)",
        },
      ],
      placeholder: "Enter full name",
    },
    {
      type: "input",
      name: "username",
      label: "Username",
      rules: [
        { required: true, message: "Please enter your username" },
        {
          pattern: "^[a-zA-Z0-9_]{3,16}$",
          message:
            "Please enter valid a username (3-16 characters, alphanumeric/underscores)",
        },
      ],
      placeholder: "Enter username",
    },
    {
      type: "input",
      name: "email",
      label: "Email",
      placeholder: "Enter email",
      rules: [
        { required: true, message: "Please enter your required" },
        {
          type: 'email',
          message: "Please enter a valid email",
        },
        // {
        //   pattern: String.raw`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
        //   message: "Please enter a valid email",
        // }
      ],
    },
    {
      type: "password",
      name: "password",
      label: "Password",
      rules: [
        { required: true, message: "Password is required" },
        {
          pattern: String.raw`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@&%*+!$])[a-zA-Z\d@&%*+!$]{8,}$`,
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
        },
      ],
      placeholder: "Enter password",
    },
    {
      type: "select",
      name: "role",
      label: "Role",
      rules: [
        {
          required: true,
          message: "Role is required",
        },
      ],
      placeholder: "Select role",
      options: roles.map((r) => ({
        value: r._id,
        label: (
          <Space>
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: r.color || "#722ed1",
              }}
            />
            <span>{r.name}</span>
          </Space>
        ),
      })),
    },
  ];

  const editFormData = [
    {
      type: "input",
      name: "name",
      label: "Full Name",
      rules: [
        {
          required: true,
          message: "Name is required",
        },
      ],
      placeholder: "Enter full name",
    },
    {
      type: "input",
      name: "username",
      label: "Username",
      rules: [
        {
          required: true,
          message: "Username is required",
        },
      ],
      placeholder: "Enter username",
    },
    {
      type: "input",
      name: "email",
      label: "Email",
      rules: [
        {
          required: true,
          message: "Email is required",
        },
        {
          type: "email",
          message: "Enter a valid email",
        },
      ],
      placeholder: "Enter email",
    },
    {
      type: "select",
      name: "role",
      label: "Role",
      rules: [
        {
          required: true,
          message: "Role is required",
        },
      ],
      placeholder: "Select role",
      options: roles.map((r) => ({
        value: r._id,
        label: (
          <Space>
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: r.color || "#722ed1",
              }}
            />
            <span>{r.name}</span>
          </Space>
        ),
      })),
    },
    {
      type: "select",
      name: "isActive",
      label: "Status",
      rules: [
        {
          required: true,
          message: "Status is required",
        },
      ],
      placeholder: "Select status",
      options: [
        {
          value: true,
          label: "Active",
        },
        {
          value: false,
          label: "Inactive",
        },
      ],
    },
    {
      type: "password",
      label: "Password",
      name: "password",
      placeholder: "Create password",
      rules: [
        {
          pattern: String.raw`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@&%*+!$])[a-zA-Z\d@&%*+!$]{8,}$`,
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
        },
      ],
    },
  ];
  return (
    <div className="space-y-4" >
      {/* Header */}
      <div className="flex items-center justify-between" >
        <div>
          <Title
            level={4}
            className="!mb-0"
            style={{ color: isDark ? "#f0f0f0" : "#2E2A27" }}
          >
            User Management
          </Title>
          <Text className="text-gray-400 text-sm" >
            Manage system users and assign roles.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetchUsers()}>
            Refresh
          </Button>

          {canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                addForm.resetFields();
                setAddModalOpen(true);
              }}
              style={{ backgroundColor: "#C76A34", borderColor: "#C76A34" }}
            >
              Add User
            </Button>
          )}
        </Space>
      </div>

      {/* Stats Row */}
      <div className="space-y-4" >
        <Row gutter={[16, 16]}>
          {userStats.map((stat) => (
            <Col xs={24} sm={12} lg={6} key={stat.title}>
              <CustomCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
              />
            </Col>
          ))}
        </Row>
      </div>

      {/* Users Table */}
      <CustomTable
        title={`All Users (${safeUsers.length})`}
        rowKey="_id"
        dataSource={safeUsers}
        columns={columns}
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />

      {/* ---------- Edit User Modal ---------- */}
      <Modal
        title={`Edit User — ${editingUser?.name || ""}`}
        open={editModalOpen}
        onOk={handleUpdate}
        confirmLoading={updateUserMutation.isPending}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingUser(null);
          editForm.resetFields();
        }}
        okText="Save Changes"
        okButtonProps={{
          style: { backgroundColor: "#C76A34", borderColor: "#C76A34" },
        }}
      >
        <CustomForm
          form={editFormData}
          formInstance={editForm}
        />
      </Modal>

      {/* ---------- Add User Modal (Admin) ---------- */}
      <Modal
        title="Create New User"
        open={addModalOpen}
        onOk={handleAddUser}
        confirmLoading={createUserMutation.isPending}
        onCancel={() => {
          setAddModalOpen(false);
          addForm.resetFields();
        }}
        okText="Create User"
        okButtonProps={{
          style: { backgroundColor: "#C76A34", borderColor: "#C76A34" },
        }}
      >
        <CustomForm
          form={addFormData}
          formInstance={addForm}
        />
      </Modal>
    </div>
  );
}

export default UsersManagementPage;
