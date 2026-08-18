import React from "react";
import { Button, Popconfirm, Space, Tag } from "antd";
import {
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

export const getBookingColumns = (showGuest, onView, canCancel, onCancel) => {
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
            label: "View",
            icon: <EyeOutlined />,
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
            label: (
              <Popconfirm
                title="Cancel this booking?"
                description="The booking will remain in history with Cancelled status."
                okText="Cancel Booking"
                cancelText="Keep Booking"
                okButtonProps={{ danger: true }}
                onConfirm={() => onCancel(record._id)}
              >
                <span className="text-red-500">Cancel</span>
              </Popconfirm>
            ),
            icon: <MoreOutlined />,
          });
        }

        return (
          <Button
            icon={<MoreOutlined />}
            size="small"
            onClick={() => {
              const cancelItem = items.find((item) => item.key === "cancel");
              if (cancelItem) {
                onView(record);
                return;
              }
              onView(record);
            }}
            style={{ color: "#C76A34", borderColor: "#C76A34" }}
          >
            View <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        );
      },
    },
  );

  return columns;
};
