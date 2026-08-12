import React from "react";
import { Modal, Form, Tag, Space, message } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import CustomForm from "../CustomForm";
import BookingCostPreview from "./BookingCostPreview";

const BookingModal = ({
  open,
  onCancel,
  onSubmit,
  rooms = [],
  roomsLoading = false,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const selectedRoom = rooms.find(
    (room) => room._id === form.getFieldValue("roomId"),
  );
  const selectedDateRange = form.getFieldValue("dateRange");

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [startDate, endDate] = values.dateRange || [];

      if (!startDate || !endDate) {
        form.setFields([
          {
            name: "dateRange",
            errors: ["Please select check-in and check-out dates before confirming the booking."],
          },
        ]);
        return;
      }

      if (endDate.isBefore(startDate, "day")) {
        form.setFields([
          {
            name: "dateRange",
            errors: ["Check-out date cannot be before check-in date."],
          },
        ]);
        return;
      }

      onSubmit({
        roomId: values.roomId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
    } catch (error) {
      if (error?.errorFields) {
        return;
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to submit the booking. Please try again.";

      message.error(
        typeof errorMessage === "string" ? errorMessage : "Unable to submit the booking. Please try again.",
      );
    }
  };

  const bookingFields = [
    {
      type: "select",
      name: "roomId",
      label: "Select Room",
      rules: [{ required: true, message: "Please select a room" }],
      props: {
        placeholder: "Choose Room",
        loading: roomsLoading,
        showSearch: true,
        optionFilterProp: "label",
      },
      options: rooms.map((room) => ({
        value: room._id,
        label: (
          <Space>
            <Tag color="blue">{room.type}</Tag>
            <span>Room #{room.roomNumber}</span>
            <span style={{ color: "#999" }}>₹{room.price}/day</span>
          </Space>
        ),
      })),
    },
    {
      type: "rangepicker",
      name: "dateRange",
      label: "Stay Duration",
      rules: [
        {
          required: true,
          message: "Please select check-in and check-out dates",
        },
        {
          validator(_, value) {
            if (!value || value.length !== 2 || !value[0] || !value[1]) {
              return Promise.resolve();
            }

            const [start, end] = value;
            if (end.isBefore(start, "day")) {
              return Promise.reject(
                new Error("Check-out date cannot be before check-in date."),
              );
            }

            if (end.diff(start, "day") < 1) {
              return Promise.reject(new Error("Minimum stay is 1 day"));
            }

            return Promise.resolve();
          },
        },
      ],
      props: {
        format: "DD MMM YYYY",
        disabledDate: (current) =>
          current && current < dayjs().startOf("day"),
      },
    },
  ];

  return (
    <Modal
      open={open}
      destroyOnHidden
      width={550}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleSubmit}
      okText="Confirm Booking"
      okButtonProps={{
        loading,
        style: { background: "#C76A34", borderColor: "#C76A34" },
      }}
      title={
        <Space>
          <HomeOutlined style={{ color: "#C76A34" }} />
          Make Booking
        </Space>
      }
    >
      <CustomForm
        form={bookingFields}
        formInstance={form}
        onFinish={handleSubmit}
      />
      <BookingCostPreview room={selectedRoom} dateRange={selectedDateRange} />
    </Modal>
  );
};

export default BookingModal;
