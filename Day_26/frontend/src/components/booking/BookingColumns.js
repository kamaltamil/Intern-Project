import React from "react";
import { Button, Space, Tag } from "antd";
import {
  EyeOutlined,
  HomeOutlined,
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
  role,
  onView
) => {
  const actionColumn = {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Button
        icon={<EyeOutlined />}
        size="small"
        onClick={() => onView(record)}
        style={{
          color: "#C76A34",
          borderColor: "#C76A34",
        }}
      >
        View
      </Button>
    ),
  };

  if (role === "Member") {
    return [
      {
        title: "Room",
        dataIndex: "room",
        render: (room) =>
          room ? (
            <Space>
              <HomeOutlined
                style={{ color: "#C76A34" }}
              />

              <Space
                direction="vertical"
                size={0}
              >
                <span className="font-semibold">
                  #{room.roomNumber}
                </span>

                <Tag
                  color={
                    roomTypeColor[room.type]
                  }
                >
                  {room.type}
                </Tag>

                <span className="text-xs text-gray-400">
                  ₹{room.price}/night
                </span>
              </Space>
            </Space>
          ) : (
            "—"
          ),
      },

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
        render: (_, record) =>
          getNights(
            record.startDate,
            record.endDate
          ),
      },

      {
        title: "Cost",
        render: (_, record) => (
          <span
            style={{
              color: "#C76A34",
              fontWeight: 600,
            }}
          >
            ₹{getTotalCost(record)}
          </span>
        ),
      },

      {
        title: "Status",
        dataIndex: "bookingStatus",
        render: (status) => (
          <Tag
            color={
              bookingStatusConfig[status]
                ?.color
            }
          >
            {status}
          </Tag>
        ),
      },

      actionColumn,
    ];
  }

  return [
    {
      title: "Room",
      dataIndex: "room",
      render: (room) =>
        room ? (
          <Space direction="vertical" size={0}>
            <span className="font-semibold">
              #{room.roomNumber}
            </span>

            <Tag
              color={
                roomTypeColor[room.type]
              }
            >
              {room.type}
            </Tag>
          </Space>
        ) : (
          "—"
        ),
    },

    {
      title: "Guest",
      dataIndex: "user",
      render: (user) =>
        user ? (
          <Space
            direction="vertical"
            size={0}
          >
            <span>{user.name}</span>

            <span className="text-xs text-gray-400">
              {user.email}
            </span>
          </Space>
        ) : (
          "—"
        ),
    },

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
      render: (_, record) =>
        getNights(
          record.startDate,
          record.endDate
        ),
    },

    {
      title: "Room Status",
      dataIndex: "roomStatus",
      render: (status) => (
        <Tag
          color={
            roomStatusColor[status]
          }
        >
          {status}
        </Tag>
      ),
    },

    {
      title: "Booking Status",
      dataIndex: "bookingStatus",
      render: (status) => (
        <Tag
          color={
            bookingStatusConfig[status]
              ?.color
          }
        >
          {status}
        </Tag>
      ),
    },

    actionColumn,
  ];
};