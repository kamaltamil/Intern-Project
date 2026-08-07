import React from "react";
import { Modal, Descriptions, Tag, Space, Button } from "antd";

import { CalendarOutlined } from "@ant-design/icons";

import {
  bookingStatusConfig,
  roomStatusColor,
  roomTypeColor,
  formatDate,
  getNights,
  getTotalCost,
} from "./BookingHelpers";

const BookingDetailsModal = ({ open, booking, role, onClose }) => {
  if (!booking) return null;

  return (
    <Modal
      open={open}
      destroyOnClose
      width={550}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      title={
        <Space>
          <CalendarOutlined style={{ color: "#C76A34" }} />
          Booking Details
        </Space>
      }
    >
      <Descriptions bordered column={1} size="small">
        {/* Room */}

        <Descriptions.Item label="Room">
          {booking.room ? (
            <Space>
              <Tag color={roomTypeColor[booking.room.type]}>
                {booking.room.type}
              </Tag>

              <span>Room #{booking.room.roomNumber}</span>
            </Space>
          ) : (
            "—"
          )}
        </Descriptions.Item>

        {/* Guest */}

        {role !== "Member" && (
          <Descriptions.Item label="Guest">
            {booking.user ? (
              <Space direction="vertical" size={0}>
                <span>{booking.user.name}</span>

                <span
                  style={{
                    fontSize: 12,
                    color: "#999",
                  }}
                >
                  {booking.user.email}
                </span>
              </Space>
            ) : (
              "—"
            )}
          </Descriptions.Item>
        )}

        {/* Check In */}

        <Descriptions.Item label="Check In">
          {formatDate(booking.startDate)}
        </Descriptions.Item>

        {/* Check Out */}

        <Descriptions.Item label="Check Out">
          {formatDate(booking.endDate)}
        </Descriptions.Item>

        {/* Duration */}

        <Descriptions.Item label="Duration">
          {getNights(booking.startDate, booking.endDate)}
        </Descriptions.Item>

        {/* Total Cost */}

        {!!booking.room?.price && (
          <Descriptions.Item label="Total Cost">
            <span
              style={{
                color: "#C76A34",
                fontWeight: 700,
              }}
            >
              ₹{getTotalCost(booking)}
            </span>
          </Descriptions.Item>
        )}

        {/* Room Status */}

        <Descriptions.Item label="Room Status">
          <Tag color={roomStatusColor[booking.roomStatus]}>
            {booking.roomStatus}
          </Tag>
        </Descriptions.Item>

        {/* Booking Status */}

        <Descriptions.Item label="Booking Status">
          <Tag color={bookingStatusConfig[booking.bookingStatus]?.color}>
            {booking.bookingStatus}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default BookingDetailsModal;
