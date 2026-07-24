import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Alert, Button, Card, Modal, Popconfirm, Space, Spin, Table, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { deleteUser, getUsers, updateUser } from "../api/authApi";
import { setUsersData } from "../store/userSlice";
import { USER_ROLES } from "../constants";

const Users = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const users = useSelector((state) => state.users.users);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formValues, setFormValues] = useState({ name: "", email: "" });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      dispatch(setUsersData(response.data || []));
    } catch (err) {
      setError("Unable to load users");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, token]);

  const openEditModal = useCallback((userRecord) => {
    setEditingUser(userRecord);
    setFormValues({ name: userRecord.name, email: userRecord.email });
    setIsModalOpen(true);
  }, []);

  const handleEditSubmit = useCallback(async () => {
    try {
      // Simplified: removed the redundant ...formValues spread that immediately
      // re-stated the same name and email keys.
      await updateUser(editingUser._id, formValues);
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError("Unable to update user");
    }
  }, [editingUser, formValues, fetchUsers]);

  const handleDeleteUser = useCallback(async (userId) => {
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err) {
      setError("Unable to delete user");
    }
  }, [fetchUsers]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
  }, []);

  const columns = useMemo(() => [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => (
        <Tag color={role === USER_ROLES.ADMIN ? "red" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {user?.role === USER_ROLES.ADMIN && (
            <>
              <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
                Edit
              </Button>
              <Popconfirm
                title="Delete this user?"
                onConfirm={() => handleDeleteUser(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />}>Delete</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ], [user?.role, openEditModal, handleDeleteUser]);

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
        onCancel={handleModalClose}
        onOk={handleEditSubmit}
        okText="Save"
      >
        <input
          className="ant-input"
          placeholder="Name"
          value={formValues.name}
          onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
          style={{ marginBottom: 12, display: "block", width: "100%" }}
        />
        <input
          className="ant-input"
          placeholder="Email"
          value={formValues.email}
          onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
          style={{ marginBottom: 12, display: "block", width: "100%" }}
        />
      </Modal>
    </>
  );
};

export default Users;
