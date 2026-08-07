import { useState } from "react";
import {
  Button,
  Tag,
  message,
  Skeleton,
  Alert,
  Typography,
  Space,
  Modal,
  Form,
  Avatar,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  PlusOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import DashboardLayout from "../components/DashboardLayout";
import CustomCard from "../components/CustomCard";
import CustomTable from "../components/CustomTable";
import CustomForm from "../components/CustomForm";

import {
  fetchUsers,
  fetchRoles,
  updateUser as updateUserApi,
  deleteUser,
  signupUser,
} from "../api/queries";

import { resolveProfileImage } from "../utils/image";

const { Title } = Typography;

const roleColor = {
  Admin: "red",
  Manager: "orange",
  Member: "blue",
};

function UsersManagementPage() {
  const queryClient = useQueryClient();

  /* ---------------- State ---------------- */

  const [updatingId, setUpdatingId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();

  /* ---------------- Queries ---------------- */

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

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  /* ---------------- Role Options ---------------- */

  const builtInRoles = new Set(["Admin", "Manager", "Member"]);
  const customRoles = roles
    .map((role) => role.name)
    .filter((name) => !builtInRoles.has(name));
  const allRoleOptions = [...builtInRoles, ...customRoles];

  const roleSelectOptions = allRoleOptions.map((role) => ({
    label: <Tag color={roleColor[role] || "purple"}>{role}</Tag>,
    value: role,
  }));

  /* ---------------- Update User ---------------- */

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
      message.error(
        error?.response?.data?.message || "Failed to update user"
      );
    },
  });

  /* ---------------- Add User ---------------- */

  const addUserMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: () => {
      message.success("User created successfully");
      setAddModalOpen(false);
      addForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || "Unable to create user"
      );
    },
  });

  /* ---------------- Delete User ---------------- */

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      message.success("User deleted successfully");
      setUpdatingId(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      setUpdatingId(null);
      message.error(
        error?.response?.data?.message || "Failed to delete user"
      );
    },
  });

  /* ---------------- Modal Handlers ---------------- */

  const openAddModal = () => {
    addForm.resetFields();
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    addForm.resetFields();
    setAddModalOpen(false);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    editForm.resetFields();
    setEditModalOpen(false);
  };

  /* ---------------- Finish Handlers (called by CustomForm's onFinish) ---------------- */

  const handleAddUserFinish = (values) => {
    addUserMutation.mutate({
      name: values.name,
      username: values.username,
      email: values.email,
      password: values.password,
      role: values.role,
    });
  };

  const handleEditUserFinish = (values) => {
    updateUserMutation.mutate({
      id: editingUser._id,
      payload: values,
    });
  };

  /* ---------------- Delete ---------------- */

  const handleDelete = (id) => {
    setUpdatingId(id);
    deleteUserMutation.mutate(id);
  };

const handleDeleteClick = (record) => {
  Modal.confirm({
    title: "Delete User",
    icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
    content: `Are you sure you want to delete ${record.name}?`,
    okText: "Delete",
    okType: "danger",
    cancelText: "Cancel",
    onOk: () => handleDelete(record._id),
  });
};

  /* ---------------- Table Columns ---------------- */

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={resolveProfileImage(record.profileImage)}
            style={{ backgroundColor: "#C76A34" }}
          >
            {!record.profileImage &&
              (record.name?.charAt(0)?.toUpperCase() || "U")}
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    { title: "Email", dataIndex: "email" },
    {
      title: "Username",
      dataIndex: "username",
      render: (username) => <span className="text-gray-500">@{username}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => <Tag color={roleColor[role] || "purple"}>{role}</Tag>,
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            style={{ borderColor: "#C76A34", color: "#C76A34" }}
          >
            Edit
          </Button>
          <Button
            danger
            loading={updatingId === record._id}
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const safeUsers = Array.isArray(users) ? users : [];

  if (usersLoading && safeUsers.length === 0) {
    return (
      <DashboardLayout>
        <Skeleton active paragraph={{ rows: 6 }} />
      </DashboardLayout>
    );
  }

  if (usersError) {
    return (
      <DashboardLayout>
        <Alert
          type="error"
          showIcon
          message={
            usersQueryError?.response?.data?.message ||
            usersQueryError?.message ||
            "Unable to load users"
          }
        />
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Admins",
      value: safeUsers.filter((u) => u.role === "Admin").length,
      icon: <CrownOutlined />,
    },
    {
      title: "Managers",
      value: safeUsers.filter((u) => u.role === "Manager").length,
      icon: <TeamOutlined />,
    },
    {
      title: "Members",
      value: safeUsers.filter((u) => u.role === "Member").length,
      icon: <UserOutlined />,
    },
  ];

  /* ---------------- CustomForm Field Definitions ---------------- */

  const addUserFields = [
    {
      type: "input",
      name: "name",
      label: "Full Name",
      placeholder: "Enter full name",
      rules: [{ required: true, message: "Name is required" }],
    },
    {
      type: "input",
      name: "username",
      label: "Username",
      placeholder: "Choose username",
      rules: [{ required: true, message: "Username is required" }],
    },
    {
      type: "input",
      name: "email",
      label: "Email",
      placeholder: "Enter email",
      rules: [
        { required: true, message: "Email is required" },
        { type: "email", message: "Enter a valid email" },
      ],
    },
    {
      type: "select",
      name: "role",
      label: "Role",
      placeholder: "Select Role",
      options: roleSelectOptions,
      rules: [{ required: true, message: "Please select a role" }],
    },
    {
      type: "password",
      name: "password",
      label: "Password",
      placeholder: "Create password",
      rules: [
        { required: true, message: "Password is required" },
        { min: 6, message: "Password must be at least 6 characters" },
      ],
    },
  ];

  const editUserFields = [
    {
      type: "input",
      name: "name",
      label: "Full Name",
      rules: [{ required: true, message: "Name is required" }],
    },
    {
      type: "input",
      name: "username",
      label: "Username",
      rules: [{ required: true, message: "Username is required" }],
    },
    {
      type: "input",
      name: "email",
      label: "Email",
      rules: [
        { required: true, message: "Email is required" },
        { type: "email", message: "Enter a valid email" },
      ],
    },
    {
      type: "select",
      name: "role",
      label: "Role",
      options: roleSelectOptions,
      rules: [{ required: true, message: "Please select a role" }],
    },
    {
      type: "password",
      name: "password",
      label: "New Password",
      placeholder: "Leave blank to keep current password",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <Title level={4} className="!text-[#2E2A27] dark:!text-[#f0f0f0]">
          User Management
        </Title>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((item) => (
            <CustomCard
              key={item.title}
              title={item.title}
              value={item.value}
              icon={item.icon}
            />
          ))}
        </div>

        <CustomTable
          title={`All Users (${safeUsers.length})`}
          isLoading={usersLoading}
          dataSource={safeUsers}
          columns={columns}
          pagination={{ pageSize: 5 }}
          extraHeader={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={refetchUsers}>
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ backgroundColor: "#C76A34", borderColor: "#C76A34" }}
                onClick={openAddModal}
              >
                Add User
              </Button>
            </Space>
          }
        />

        {/* ---------------- Add User Modal ---------------- */}
        <Modal
          title="Add User"
          open={addModalOpen}
          onCancel={closeAddModal}
          onOk={() => addForm.submit()}
          okText="Create User"
          okButtonProps={{
            loading: addUserMutation.isPending,
            style: { backgroundColor: "#C76A34", borderColor: "#C76A34" },
          }}
        >
          <CustomForm
            form={addUserFields}
            formInstance={addForm}
            onFinish={handleAddUserFinish}
            className="mt-2"
          />
        </Modal>

        {/* ---------------- Edit User Modal ---------------- */}
        <Modal
          title={`Edit ${editingUser?.name ?? ""}`}
          open={editModalOpen}
          onCancel={closeEditModal}
          onOk={() => editForm.submit()}
          okText="Save Changes"
          okButtonProps={{
            loading: updateUserMutation.isPending,
            style: { backgroundColor: "#C76A34", borderColor: "#C76A34" },
          }}
        >
          <CustomForm
            form={editUserFields}
            formInstance={editForm}
            onFinish={handleEditUserFinish}
            className="mt-2"
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default UsersManagementPage;