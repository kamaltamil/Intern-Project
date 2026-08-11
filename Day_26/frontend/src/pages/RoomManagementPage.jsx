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
  HomeOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";

import DashboardLayout from "../components/DashboardLayout";
import PermissionGate from "../components/PermissionGate";
import CustomForm from "../components/CustomForm";
import CustomTable from "../components/CustomTable";

import {
  createRoom,
  deleteRoom,
  fetchRooms,
} from "../store/slices/roomSlice";

const { Title, Text } = Typography;

function RoomManagementPage() {
  const dispatch = useDispatch();

  const {
    rooms = [],
    loading,
    creating,
    deleting,
    error,
    createError,
    deleteError,
  } = useSelector((state) => state.room);

  const { theme } = useSelector((state) => state.auth);

  const [form] = Form.useForm();

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const isDark = theme === "dark";

  /* ---------------------------------------------------------------------- */
  /*                              Fetch Rooms                               */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  /* ---------------------------------------------------------------------- */
  /*                              Open Modal                                */
  /* ---------------------------------------------------------------------- */

  const openCreateModal = () => {
    form.resetFields();
    setIsCreateModalOpen(true);
  };

  /* ---------------------------------------------------------------------- */
  /*                              Close Modal                               */
  /* ---------------------------------------------------------------------- */

  const closeCreateModal = () => {
    if (creating) {
      return;
    }

    form.resetFields();
    setIsCreateModalOpen(false);
  };

  /* ---------------------------------------------------------------------- */
  /*                              Create Room                               */
  /* ---------------------------------------------------------------------- */

  const handleCreateRoom = async (values) => {
    const payload = {
      roomNumber: values.roomNumber.trim(),
      type: values.type,
      price: Number(values.price),
    };

    try {
      /*
       * IMPORTANT:
       * await is required here.
       *
       * Without await, the room can be created successfully in the
       * backend but the frontend receives the Promise instead of the
       * fulfilled Redux action and displays "Failed to create room".
       */
      const result = await dispatch(createRoom(payload));

      if (createRoom.fulfilled.match(result)) {
        message.success("Room created successfully");

        form.resetFields();
        setIsCreateModalOpen(false);

        /*
         * Fetch again so the table always contains the latest
         * backend data.
         */
        dispatch(fetchRooms());
      } else {
        message.error(
          result.payload || "Failed to create room"
        );
      }
    } catch (error) {
      message.error(
        error?.message || "Failed to create room"
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                              Delete Room                               */
  /* ---------------------------------------------------------------------- */

  const handleDeleteRoom = async (roomId) => {
    try {
      const result = await dispatch(deleteRoom(roomId));

      if (deleteRoom.fulfilled.match(result)) {
        message.success("Room deleted successfully");

        /*
         * Refresh the list after successful deletion.
         */
        dispatch(fetchRooms());
      } else {
        message.error(
          result.payload || "Failed to delete room"
        );
      }
    } catch (error) {
      message.error(
        error?.message || "Failed to delete room"
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                              Room Columns                              */
  /* ---------------------------------------------------------------------- */

  const columns = [
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",

      render: (value) => (
        <Space>
          <HomeOutlined
            style={{
              color: "#C76A34",
            }}
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
      title: "Price / Night",
      dataIndex: "price",
      key: "price",

      render: (value) => (
        <Text strong>
          ${Number(value).toFixed(2)}
        </Text>
      ),
    },

    {
      title: "Actions",
      key: "actions",

      render: (_, record) => (
        <PermissionGate
          resource="rooms"
          action="delete"
        >
          <Popconfirm
            title="Delete this room?"
            description={
              <>
                Are you sure you want to delete room{" "}
                <strong>{record.roomNumber}</strong>?
              </>
            }
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
              loading: deleting,
            }}
            onConfirm={() =>
              handleDeleteRoom(record._id)
            }
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
      ),
    },
  ];

  /* ---------------------------------------------------------------------- */
  /*                              Form Fields                               */
  /* ---------------------------------------------------------------------- */

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
          message:
            "Room number cannot exceed 10 characters",
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
      label: "Price Per Night",
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

  /* ---------------------------------------------------------------------- */
  /*                              UI                                         */
  /* ---------------------------------------------------------------------- */

  return (
    <DashboardLayout>
      <div className="p-4">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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

            <Text type="secondary">
              Create and view hotel room inventory.
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

        {/* ---------------------------------------------------------------- */}
        {/* Fetch Error                                                       */}
        {/* ---------------------------------------------------------------- */}

        {error && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            message={error}
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() =>
                  dispatch(fetchRooms())
                }
              >
                Retry
              </Button>
            }
          />
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Create Error                                                      */}
        {/* ---------------------------------------------------------------- */}

        {createError && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            message={createError}
          />
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Delete Error                                                      */}
        {/* ---------------------------------------------------------------- */}

        {deleteError && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            message={deleteError}
          />
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Create Room Modal                                                 */}
        {/* ---------------------------------------------------------------- */}

        <Modal
          title={
            <Space>
              <HomeOutlined
                style={{
                  color: "#C76A34",
                }}
              />

              <span>Create New Room</span>
            </Space>
          }
          open={isCreateModalOpen}
          width={520}
          centered
          destroyOnHidden
          okText="Create Room"
          cancelText="Cancel"
          confirmLoading={creating}
          okButtonProps={{
            style: {
              backgroundColor: "#C76A34",
              borderColor: "#C76A34",
            },
          }}
          onCancel={closeCreateModal}
          onOk={() => form.submit()}
        >
          <CustomForm
            form={roomFormFields}
            formInstance={form}
            onFinish={handleCreateRoom}
            layout="vertical"
            className="mt-6"
          />
        </Modal>

        {/* ---------------------------------------------------------------- */}
        {/* Rooms Table                                                      */}
        {/* ---------------------------------------------------------------- */}

        <CustomTable
          title={
            <Space>
              <HomeOutlined
                style={{
                  color: "#C76A34",
                }}
              />

              <span>Hotel Rooms</span>
            </Space>
          }
          extraHeader={
            <Button
              icon={<ReloadOutlined />}
              onClick={() =>
                dispatch(fetchRooms())
              }
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
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
          }}
          scroll={{
            x: 700,
          }}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Empty State                                                      */}
        {/* ---------------------------------------------------------------- */}

        {!loading && rooms.length === 0 && !error && (
          <div className="hidden">
            <Empty description="No rooms found" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default RoomManagementPage;