import React from "react";
import { Modal, Form, Tag, Space } from "antd";
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
    const values = await form.validateFields();
    const [startDate, endDate] = values.dateRange;

    onSubmit({
      roomId: values.roomId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
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
        { required: true, message: "Select dates" },
        {
          validator(_, value) {
            if (!value) return Promise.resolve();
            const [start, end] = value;
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
