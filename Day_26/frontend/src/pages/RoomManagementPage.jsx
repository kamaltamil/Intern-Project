import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Empty,
  Form,
  Modal,
  Popconfirm,
  Space,
  Tag,
  Typography,
  message,
} from "antd";

import {
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";

import PermissionGate from "../components/PermissionGate";
import CustomForm from "../components/CustomForm";
import CustomTable from "../components/CustomTable";

import {
  createRoom,
  deleteRoom,
  fetchRooms,
  updateRoom,
} from "../store/slices/roomSlice";

const { Title, Text } = Typography;

const roomFormFields = [
  {
    type: "input",
    label: "Room Number",
    name: "roomNumber",
    placeholder: "Enter room number",
    props: { maxLength: 10 },
    rules: [
      { required: true, message: "Room number is required" },
      { whitespace: true, message: "Room number cannot be empty" },
      { max: 10, message: "Room number cannot exceed 10 characters" },
    ],
  },
  {
    type: "select",
    label: "Room Type",
    name: "type",
    placeholder: "Select room type",
    options: [
      { value: "Single", label: "Single" },
      { value: "Double", label: "Double" },
      { value: "Suite", label: "Suite" },
    ],
    rules: [{ required: true, message: "Room type is required" }],
  },
  {
    type: "number",
    label: "Price Per Night",
    name: "price",
    placeholder: "Enter price",
    props: { min: 0, precision: 2 },
    rules: [
      { required: true, message: "Price is required" },
      { type: "number", min: 0, message: "Price cannot be negative" },
    ],
  },
];

function RoomManagementPage() {
  const dispatch = useDispatch();
  const {
    rooms = [],
    loading,
    creating,
    updating,
    deleting,
    error,
    createError,
    updateError,
    deleteError,
  } = useSelector((state) => state.room);
  const { theme } = useSelector((state) => state.auth);

  const [form] = Form.useForm();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const isDark = theme === "dark";

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  const openCreateModal = () => {
    form.resetFields();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (room) => {
    form.setFieldsValue({
      roomNumber: room.roomNumber,
      type: room.type,
      price: Number(room.price),
    });
    setEditingRoom(room);
  };

  const closeModal = () => {
    if (creating || updating) return;
    form.resetFields();
    setIsCreateModalOpen(false);
    setEditingRoom(null);
  };

  const handleSubmit = async (values) => {
    const payload = {
      roomNumber: values.roomNumber.trim(),
      type: values.type,
      price: Number(values.price),
    };

    if (editingRoom) {
      const result = await dispatch(
        updateRoom({ id: editingRoom._id, payload })
      );

      if (updateRoom.fulfilled.match(result)) {
        message.success("Room updated successfully");
        closeModal();
      } else {
        message.error(result.payload || "Failed to update room");
      }
      return;
    }

    const result = await dispatch(createRoom(payload));

    if (createRoom.fulfilled.match(result)) {
      message.success("Room created successfully");
      closeModal();
    } else {
      message.error(result.payload || "Failed to create room");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const result = await dispatch(deleteRoom(roomId));

    if (deleteRoom.fulfilled.match(result)) {
      message.success("Room deleted successfully");
    } else {
      message.error(result.payload || "Failed to delete room");
    }
  };

  const columns = [
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
      render: (value) => (
        <Space>
          <HomeOutlined style={{ color: "#C76A34" }} />
          <Text strong>{value}</Text>
        </Space>
      ),
    },
    {
      title: "Room Type",
      dataIndex: "type",
      key: "type",
      render: (value) => {
        const colorMap = {
          Single: "blue",
          Double: "green",
          Suite: "purple",
        };
        return <Tag color={colorMap[value] || "default"}>{value}</Tag>;
      },
    },
    {
      title: "Price / Night",
      dataIndex: "price",
      key: "price",
      render: (value) => <Text strong>₹{Number(value).toLocaleString("en-IN")}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <PermissionGate resource="rooms" action="update">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            >
              Edit
            </Button>
          </PermissionGate>

          <PermissionGate resource="rooms" action="delete">
            <Popconfirm
              title="Delete this room?"
              description={`Are you sure you want to delete room ${record.roomNumber}?`}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading: deleting }}
              onConfirm={() => handleDeleteRoom(record._id)}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={deleting}
              >
                Delete
              </Button>
            </Popconfirm>
          </PermissionGate>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Title
            level={3}
            className="!mb-1"
            style={{ color: isDark ? "#f0f0f0" : "#2E2A27" }}
          >
            Room Management
          </Title>
          <Text type="secondary">Create, update and view hotel room inventory.</Text>
        </div>

        <PermissionGate resource="rooms" action="create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            style={{ backgroundColor: "#C76A34", borderColor: "#C76A34" }}
          >
            Create Room
          </Button>
        </PermissionGate>
      </div>

      {(error || createError || updateError || deleteError) && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message={error || createError || updateError || deleteError}
        />
      )}

      <Modal
        title={
          <Space>
            <HomeOutlined style={{ color: "#C76A34" }} />
            <span>{editingRoom ? "Edit Room" : "Create New Room"}</span>
          </Space>
        }
        open={isCreateModalOpen || Boolean(editingRoom)}
        width={520}
        centered
        destroyOnHidden
        okText={editingRoom ? "Save Changes" : "Create Room"}
        cancelText="Cancel"
        confirmLoading={creating || updating}
        okButtonProps={{
          style: { backgroundColor: "#C76A34", borderColor: "#C76A34" },
        }}
        onCancel={closeModal}
        onOk={() => form.submit()}
      >
        <CustomForm
          form={roomFormFields}
          formInstance={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="mt-6"
        />
      </Modal>

      <CustomTable
        title={
          <Space>
            <HomeOutlined style={{ color: "#C76A34" }} />
            <span>Hotel Rooms</span>
          </Space>
        }
        extraHeader={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => dispatch(fetchRooms())}
            loading={loading}
          >
            Refresh
          </Button>
        }
        isLoading={loading}
        isError={Boolean(error)}
        rowKey="_id"
        dataSource={rooms}
        columns={columns}
        pagination={{ pageSize: 8, showSizeChanger: true }}
      />

      {!loading && rooms.length === 0 && !error && (
        <div className="hidden">
          <Empty description="No rooms found" />
        </div>
      )}
    </div>
  );
}

export default RoomManagementPage;
