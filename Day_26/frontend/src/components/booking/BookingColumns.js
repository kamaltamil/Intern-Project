import React from "react";
import { Button, Dropdown, Modal, Space, Tag } from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EyeOutlined,
  HomeOutlined,
  MoreOutlined,
} from "@ant-design/icons";

import {
  bookingStatusConfig,
  roomStatusColor,
  roomTypeColor,
  formatDate,
  getNights,
  getTotalCost,
} from "./BookingHelpers";

export const getBookingColumns = (
  showGuest,
  onView,
  canCancel,
  onCancel,
  canDelete,
  onDelete,
) => {
  const columns = [
    {
      title: "Room",
      dataIndex: "room",
      render: (room) =>
        room ? (
          <Space>
            <HomeOutlined style={{ color: "#C76A34" }} />
            <Space direction="vertical" size={0}>
              <span className="font-semibold">{room.roomNumber}</span>
              <Tag color={roomTypeColor[room.type]}>{room.type}</Tag>
              <span className="text-xs text-gray-400">₹{room.price}/day</span>
            </Space>
          </Space>
        ) : (
          "—"
        ),
    },
  ];

  if (showGuest) {
    columns.push({
      title: "Guest",
      dataIndex: "user",
      render: (user) => user?.name || "—",
    });
  }

  columns.push(
    {
      title: "Check In",
      dataIndex: "startDate",
      render: formatDate,
    },
    {
      title: "Check Out",
      dataIndex: "endDate",
      render: formatDate,
    },
    {
      title: "Duration",
      render: (_, record) => getNights(record.startDate, record.endDate),
    },
    {
      title: "Cost",
      render: (_, record) => (
        <span style={{ color: "#C76A34", fontWeight: 600 }}>
          ₹{getTotalCost(record)}
        </span>
      ),
    },
    {
      title: "Room Status",
      dataIndex: "roomStatus",
      render: (status) => (
        <Tag color={roomStatusColor[status]}>{status}</Tag>
      ),
    },
    {
      title: "Booking Status",
      dataIndex: "bookingStatus",
      render: (status) => (
        <Tag color={bookingStatusConfig[status]?.color}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const items = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View Details",
            onClick: () => onView(record),
          },
        ];

        const canCancelStatus = ![
          "Cancelled",
          "CheckedOut",
          "Rejected",
        ].includes(record.bookingStatus);

        if (canCancel && canCancelStatus) {
          items.push({
            key: "cancel",
            icon: <DeleteOutlined />,
            label: "Cancel Booking",
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: "Cancel Booking",
                content:
                  "Are you sure you want to cancel this booking? The booking will remain in history.",
                okText: "Cancel Booking",
                cancelText: "Keep Booking",
                okButtonProps: { danger: true },
                onOk: () => onCancel(record._id),
              });
            },
          });
        }

        if (canDelete) {
          items.push({
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Delete Booking",
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: "Delete Booking",
                content:
                  "Are you sure you want to permanently delete this booking?",
                okText: "Delete Booking",
                cancelText: "Keep Booking",
                okButtonProps: { danger: true },
                onOk: () => onDelete(record._id),
              });
            },
          });
        }

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button icon={<MoreOutlined />} size="small">
              Actions <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
        );
      },
    },
  );

  return columns;
};
