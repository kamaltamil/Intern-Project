import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const BookingStats = (bookings = []) => {

  const total = bookings.length;

  const active = bookings.filter(
    (b) =>
      b.bookingStatus === "Booked" ||
      b.bookingStatus === "CheckedIn"
  ).length;

  const pending = bookings.filter(
    (b) => b.bookingStatus === "Payment Pending"
  ).length;

  const cancelled = bookings.filter(
    (b) => b.bookingStatus === "Cancelled"
  ).length;

  return [
    {
      title: "Total",
      value: total,
      icon: <CalendarOutlined />,
    },

    {
      title: "Active",
      value: active,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
    },

    {
      title: "Pending",
      value: pending,
      icon: <ClockCircleOutlined />,
      color: "#faad14",
    },

    {
      title: "Cancelled",
      value: cancelled,
      icon: <CloseCircleOutlined />,
      color: "#ff4d4f",
    },
  ];
};

export default BookingStats;