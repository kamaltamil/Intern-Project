import { useState } from "react";

import {
  Alert,
  Button,
  Dropdown,
  Empty,
  Form,
  Modal,
  Space,
  Tag,
  Typography,
  message,
} from "antd";

import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  HomeOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { useSelector } from "react-redux";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import PermissionGate from "../components/PermissionGate";
import CustomForm from "../components/CustomForm";
import CustomTable from "../components/CustomTable";

import {
  fetchRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../api/queries";

import usePermission from "../hooks/usePermission";

const { Title, Text } = Typography;

const roomFormFields = [
  {
    type: "input",
    label: "Room Number",
    name: "roomNumber",
    placeholder: "Enter room number",
    props: {
      maxLength: 10,
    },
    rules: [
      {
        required: true,
        message: "Room number is required",
      },
      {
        whitespace: true,
        message: "Room number cannot be empty",
      },
      {
        max: 10,
        message: "Room number cannot exceed 10 characters",
      },
    ],
  },
  {
    type: "select",
    label: "Room Type",
    name: "type",
    placeholder: "Select room type",
    options: [
      {
        value: "Single",
        label: "Single",
      },
      {
        value: "Double",
        label: "Double",
      },
      {
        value: "Suite",
        label: "Suite",
      },
    ],
    rules: [
      {
        required: true,
        message: "Room type is required",
      },
    ],
  },
  {
    type: "number",
    label: "Price Per Day",
    name: "price",
    placeholder: "Enter price",
    props: {
      min: 0,
      precision: 2,
    },
    rules: [
      {
        required: true,
        message: "Price is required",
      },
      {
        type: "number",
        min: 0,
        message: "Price cannot be negative",
      },
    ],
  },
];

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.response?.data?.errors?.[0]?.msg ||
  error?.response?.data?.errors?.[0]?.message ||
  error?.message ||
  fallback;

function RoomManagementPage() {
  const queryClient = useQueryClient();

  const { theme } = useSelector((state) => state.auth);

  const [form] = Form.useForm();

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [editingRoom, setEditingRoom] = useState(null);

  const isDark = theme === "dark";

  const canUpdate = usePermission("rooms", "update");
  const canDelete = usePermission("rooms", "delete");

  const actionColumn = canUpdate || canDelete;

  /* -------------------------------------------------------------------------- */
  /*                              Fetch Rooms                                   */
  /* -------------------------------------------------------------------------- */

  const {
    data: rooms = [],
    isLoading: roomsLoading,
    isError: roomsError,
    error: roomsQueryError,
    refetch: refetchRooms,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

  /* -------------------------------------------------------------------------- */
  /*                              Create Room                                   */
  /* -------------------------------------------------------------------------- */

  const createRoomMutation = useMutation({
    mutationFn: createRoom,

    onSuccess: (response) => {
      message.success(
        response?.message || "Room created successfully"
      );

      setIsCreateModalOpen(false);
      form.resetFields();

      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },

    onError: (error) => {
      message.error(
        getErrorMessage(error, "Failed to create room")
      );
    },
  });

  /* -------------------------------------------------------------------------- */
  /*                              Update Room                                   */
  /* -------------------------------------------------------------------------- */

  const updateRoomMutation = useMutation({
    mutationFn: updateRoom,

    onSuccess: (response) => {
      message.success(
        response?.message || "Room updated successfully"
      );

      setEditingRoom(null);
      form.resetFields();

      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },

    onError: (error) => {
      message.error(
        getErrorMessage(error, "Failed to update room")
      );
    },
  });

  /* -------------------------------------------------------------------------- */
  /*                              Delete Room                                   */
  /* -------------------------------------------------------------------------- */

  const deleteRoomMutation = useMutation({
    mutationFn: deleteRoom,

    onSuccess: (response) => {
      message.success(
        response?.message || "Room deleted successfully"
      );

      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },

    onError: (error) => {
      message.error(
        getErrorMessage(error, "Failed to delete room")
      );
    },
  });

  const openCreateModal = () => {
    form.resetFields();
    setEditingRoom(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (room) => {
    form.setFieldsValue({
      roomNumber: room.roomNumber,
      type: room.type,
      price: Number(room.price),
    });

    setEditingRoom(room);
    setIsCreateModalOpen(false);
  };

  const closeModal = () => {
    if (
      createRoomMutation.isPending ||
      updateRoomMutation.isPending
    ) {
      return;
    }

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
      updateRoomMutation.mutate({
        id: editingRoom._id,
        payload,
      });

      return;
    }

    createRoomMutation.mutate(payload);
  };

  const handleDeleteRoom = (roomId) => {
    deleteRoomMutation.mutate(roomId);
  };

  const roomActionItems = (record) => {
    const items = [];

    if (canUpdate) {
      items.push({
        key: "edit",
        icon: <EditOutlined />,
        label: "Edit Room",
        onClick: () => openEditModal(record),
      });
    }

    if (canDelete) {
      items.push({
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Delete Room",
        danger: true,

        onClick: () => {
          Modal.confirm({
            title: "Delete Room",
            content: `Are you sure you want to delete room ${record.roomNumber}?`,
            okText: "Delete",
            okType: "danger",
            onOk: () => handleDeleteRoom(record._id),
          });
        },
      });
    }

    return items;
  };

  const columns = [
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",

      render: (value) => (
        <Space>
          <HomeOutlined
            style={{ color: "#C76A34" }}
          />

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

        return (
          <Tag color={colorMap[value] || "default"}>
            {value}
          </Tag>
        );
      },
    },

    {
      title: "Price / Day",
      dataIndex: "price",
      key: "price",

      render: (value) => (
        <Text strong>
          ₹{Number(value).toLocaleString("en-IN")}
        </Text>
      ),
    },

    ...(actionColumn
      ? [
          {
            title: "Actions",
            key: "actions",
            width: 130,

            render: (_, record) => (
              <Dropdown
                menu={{
                  items: roomActionItems(record),
                }}
                trigger={["click"]}
              >
                <Button
                  icon={<MoreOutlined />}
                  loading={deleteRoomMutation.isPending}
                >
                  Actions{" "}
                  <DownOutlined
                    style={{ fontSize: 10 }}
                  />
                </Button>
              </Dropdown>
            ),
          },
        ]
      : []),
  ];

  const roomError = roomsError
    ? getErrorMessage(
        roomsQueryError,
        "Unable to load rooms."
      )
    : null;

  return (
    <div className="space-y-4">
      {/* Page Header */}

      <div className="flex items-center justify-between sm:flex-row flex-col sm:gap-0 gap-3 sm:text-start text-center">
        <div>
          <Title
            level={3}
            className="!mb-1"
            style={{
              color: isDark
                ? "#f0f0f0"
                : "#2E2A27",
            }}
          >
            Room Management
          </Title>

          <Text className="text-gray-400 text-sm">
            Create, update and view hotel room
            inventory.
          </Text>
        </div>

        <PermissionGate
          resource="rooms"
          action="create"
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            style={{
              backgroundColor: "#C76A34",
              borderColor: "#C76A34",
            }}
          >
            Create Room
          </Button>
        </PermissionGate>
      </div>

      {/* API Error */}

      {roomError && (
        <Alert
          type="error"
          showIcon
          message={roomError}
        />
      )}

      {/* Create / Edit Modal */}

      <Modal
        title={
          <Space>
            <HomeOutlined
              style={{ color: "#C76A34" }}
            />

            <span>
              {editingRoom
                ? "Edit Room"
                : "Create New Room"}
            </span>
          </Space>
        }
        open={
          isCreateModalOpen ||
          Boolean(editingRoom)
        }
        width={520}
        centered
        destroyOnHidden
        okText={
          editingRoom
            ? "Save Changes"
            : "Create Room"
        }
        cancelText="Cancel"
        confirmLoading={
          createRoomMutation.isPending ||
          updateRoomMutation.isPending
        }
        okButtonProps={{
          style: {
            backgroundColor: "#C76A34",
            borderColor: "#C76A34",
          },
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

      {/* Rooms Table */}

      <CustomTable
        title={
          <Space>
            <HomeOutlined
              style={{ color: "#C76A34" }}
            />

            <span>Hotel Rooms</span>
          </Space>
        }

        extraHeader={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetchRooms()}
            loading={roomsLoading}
          >
            Refresh
          </Button>
        }

        isLoading={roomsLoading}
        isError={roomsError}
        rowKey="_id"
        dataSource={Array.isArray(rooms) ? rooms : []}
        columns={columns}
      />

      {!roomsLoading &&
        rooms.length === 0 &&
        !roomsError && (
          <div className="hidden">
            <Empty description="No rooms found" />
          </div>
        )}
    </div>
  );
}

export default RoomManagementPage;