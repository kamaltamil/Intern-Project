import { useContext, useEffect, useState } from "react";
import { Alert, Button, Card, Input, Modal, Popconfirm, Space, Spin, Table, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext";
import { deleteUser, getUsers, updateUser } from "../api/authApi";

const Users = () => {
  const { user, token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formValues, setFormValues] = useState({ name: "", email: "" });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (err) {
      setError("Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const openEditModal = (userRecord) => {
    setEditingUser(userRecord);
    setFormValues({ name: userRecord.name, email: userRecord.email });
    setIsModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await updateUser(editingUser._id, formValues);
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError("Unable to update user");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err) {
      setError("Unable to delete user");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => <Tag color={role === "Admin" ? "red" : role === "Member" ? "blue" : "green"}>{role}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {user?.role === "Admin" && (
            <>
              <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
                Edit
              </Button>
              <Popconfirm title="Delete this user?" onConfirm={() => handleDeleteUser(record._id)} okText="Yes" cancelText="No">
                <Button danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "role",
      render: (role) => <Tag color={role === "Admin" ? "red" : role === "Member" ? "blue" : "green"}>{role}</Tag>,
    },
  ];

  if (loading) return <Spin size="large" />;

  return (
    <>
      <Card title="Users">
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
        <Table rowKey="_id" columns={columns} dataSource={users} />
      </Card>

      <Modal
        title="Edit User"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onOk={handleEditSubmit}
        okText="Save"
      >
        <Input
          placeholder="Name"
          value={formValues.name}
          onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
          style={{ marginBottom: 12 }}
        />
        <Input
          placeholder="Email"
          value={formValues.email}
          onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
        />
      </Modal>
    </>
  );
};

export default Users;
