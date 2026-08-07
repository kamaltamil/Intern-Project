import { useState } from "react";
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
  Input,
  Select,
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
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import DashboardLayout from "../components/DashboardLayout";
import CustomCard from "../components/CustomCard";
import CustomTable from "../components/CustomTable";

import {
  fetchUsers,
  fetchRoles,
  updateUser as updateUserApi,
  deleteUser,
  signupUser,
} from "../api/queries";

import { resolveProfileImage } from "../utils/image";

const { Title } = Typography;
const { Option } = Select;

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

  /* ---------------- Update User ---------------- */

  const updateUserMutation = useMutation({
    mutationFn: updateUserApi,

    onSuccess: () => {
      message.success("User updated successfully");

      setEditModalOpen(false);
      setEditingUser(null);
      editForm.resetFields();

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },

    onError: (error) => {
      message.error(
        error?.response?.data?.message ||
          "Failed to update user"
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

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },

    onError: (error) => {
      message.error(
        error?.response?.data?.message ||
          "Unable to create user"
      );
    },
  });

  /* ---------------- Delete User ---------------- */

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,

    onSuccess: () => {
      message.success("User deleted successfully");

      setUpdatingId(null);

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },

    onError: (error) => {
      setUpdatingId(null);

      message.error(
        error?.response?.data?.message ||
          "Failed to delete user"
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

  /* ---------------- Save Edit ---------------- */

  const handleEditSave = async () => {
    try {
      const values = await editForm.validateFields();

      updateUserMutation.mutate({
        id: editingUser._id,
        payload: values,
      });
    } catch {
      // validation handled by antd
    }
  };

  /* ---------------- Add User ---------------- */

  const handleAddUser = async () => {
    try {
      const values = await addForm.validateFields();

      addUserMutation.mutate({
        name: values.name,
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
      });
    } catch (err) {
      console.log(err)
    }
  };
  /* ---------------- Delete ---------------- */

  const handleDelete = (id) => {
    setUpdatingId(id);
    deleteUserMutation.mutate(id);
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
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Username",
      dataIndex: "username",
      render: (username) => (
        <span className="text-gray-500">@{username}</span>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => (
        <Tag color={roleColor[role] || "purple"}>
          {role}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            style={{
              borderColor: "#C76A34",
              color: "#C76A34",
            }}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete User"
            description={`Delete ${record.name}?`}
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              loading={updatingId === record._id}
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ---------------- Loading ---------------- */

  if (usersLoading && users.length === 0) {
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
            usersQueryError?.message ??
            "Unable to load users"
          }
        />
      </DashboardLayout>
    );
  }

  /* ---------------- Dashboard Cards ---------------- */

  const stats = [
    {
      title: "Admins",
      value: users.filter((u) => u.role === "Admin").length,
      icon: <CrownOutlined />,
    },
    {
      title: "Managers",
      value: users.filter((u) => u.role === "Manager").length,
      icon: <TeamOutlined />,
    },
    {
      title: "Members",
      value: users.filter((u) => u.role === "Member").length,
      icon: <UserOutlined />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5">

        <Title level={4}>
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
          title={`All Users (${users.length})`}
          isLoading={usersLoading}
          dataSource={users}
          columns={columns}
          pagination={{ pageSize: 5 }}
          extraHeader={
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={refetchUsers}
              >
                Refresh
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  backgroundColor: "#C76A34",
                  borderColor: "#C76A34",
                }}
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
          onOk={handleAddUser}
          okText="Create User"
          okButtonProps={{
            loading: addUserMutation.isPending,
            style: {
              backgroundColor: "#C76A34",
              borderColor: "#C76A34",
            },
          }}
        >
          <Form
            layout="vertical"
            form={addForm}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                {
                  required: true,
                  message: "Name is required",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="username"
              label="Username"
              rules={[
                {
                  required: true,
                  message: "Username is required",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
                name="role"
                label="Role"
                rules={[
                  {
                    required: true,
                    message: "Please select a role",
                  },
                ]}
              >
                <Select placeholder="Select Role">
                  {allRoleOptions.map((role) => (
                    <Option key={role} value={role}>
                      <Tag color={roleColor[role] || "purple"}>
                        {role}
                      </Tag>
                    </Option>
                  ))}
                </Select>
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  min: 6,
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Form>
        </Modal>

        {/* ---------------- Edit User Modal ---------------- */}

        <Modal
          title={`Edit ${editingUser?.name ?? ""}`}
          open={editModalOpen}
          onCancel={closeEditModal}
          onOk={handleEditSave}
          okText="Save Changes"
          okButtonProps={{
            loading: updateUserMutation.isPending,
            style: {
              backgroundColor: "#C76A34",
              borderColor: "#C76A34",
            },
          }}
        >
          <Form
            form={editForm}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true }]}
            >
              <Select>
                {allRoleOptions.map((role) => (
                  <Option
                    key={role}
                    value={role}
                  >
                    {role}
                  </Option>
                ))}
              </Select>
            </Form.Item>
                
            <Form.Item
              name="password"
              label="New Password"
            >
              <Input.Password placeholder="Leave blank to keep current password" />
            </Form.Item>
          </Form>
        </Modal>

      </div>
    </DashboardLayout>
  );
}

export default UsersManagementPage;