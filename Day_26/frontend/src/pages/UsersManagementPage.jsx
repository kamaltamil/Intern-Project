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
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../components/DashboardLayout";
import {
  fetchUsers,
  fetchRoles,
  updateUser as updateUserApi,
  deleteUser,
} from "../api/queries";
import CustomCard from "../components/CustomCard";
import CustomTable from "../components/CustomTable";

const { Title } = Typography;
const { Option } = Select;

const roleColor = {
  Admin: "red",
  Manager: "orange",
  Member: "blue",
};

function UsersManagementPage() {
  const [updatingId, setUpdatingId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersError,
    error: usersQueryError,
    refetch: refetchUsers,
  } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUserApi,
    onSuccess: () => {
      message.success("User updated successfully");
      setEditModalOpen(false);
      setEditingUser(null);
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Failed to update user");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      message.success("User deleted successfully");
      setUpdatingId(null);
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Failed to delete user");
      setUpdatingId(null);
    },
  });

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
      updateUserMutation.mutate({ id: editingUser._id, payload: values });
    } catch (err) {
      if (err?.errorFields) return;
    }
  };

  const handleDelete = (userId) => {
    setUpdatingId(userId);
    deleteUserMutation.mutate(userId);
  };

  const builtInRoles = new Set(["Admin", "Manager", "Member"]);
  const customRoleNames = roles
    .map((r) => r.name)
    .filter((n) => !builtInRoles.has(n));
  const allRoleOptions = [...builtInRoles, ...customRoleNames];

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#C76A34] flex items-center justify-center text-white font-semibold text-sm">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => <span className="text-gray-600">{email}</span>,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (username) => <span className="text-gray-500">@{username}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color={roleColor[role] || "purple"}>{role}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
            style={{ borderColor: "#C76A34", color: "#C76A34" }}
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
          message={usersQueryError?.message || "Unable to load users"}
          showIcon
        />
      </DashboardLayout>
    );
  }

  const totalAdmins = users.filter((u) => u.role === "Admin").length;
  const totalManagers = users.filter((u) => u.role === "Manager").length;
  const totalMembers = users.filter((u) => u.role === "Member").length;

  const userManagementStats = [
    { title: "Admins", value: totalAdmins, icon: <CrownOutlined /> },
    { title: "Managers", value: totalManagers, icon: <TeamOutlined /> },
    { title: "Members", value: totalMembers, icon: <UserOutlined /> }
  ];

  return (
    <DashboardLayout> 
      <div className="space-y-4">
        <Title level={4} className="!text-[#2E2A27]">
          User Management
        </Title>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {
            userManagementStats.map((stat) => (
              <CustomCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon} 
                key={stat.title}
              />
            ))
          }
        </div>

        {/* Users Table */}
        <CustomTable
          title={`All Users (${users.length})`}
          extraHeader={<Button onClick={refetchUsers} size="small" loading={usersLoading}>Refresh</Button>}
          isLoading={usersLoading}
          dataSource={users}
          columns={columns}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 600 }}
        />
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
          style: { backgroundColor: "#C76A34", borderColor: "#C76A34" },
          loading: updateUserMutation.isLoading,
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: "Name is required" },
              { min: 3, message: "Name must be at least 3 characters" },
            ]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: "Username is required" },
              { min: 3, message: "Username must be at least 3 characters" },
            ]}
          >
            <Input prefix="@" placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Role is required" }]}
          >
            <Select placeholder="Select role">
              {allRoleOptions.map((r) => (
                <Option key={r} value={r}>
                  <Tag color={roleColor[r] || "purple"}>{r}</Tag>
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
