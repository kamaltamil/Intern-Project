import dayjs from "dayjs";

export const bookingStatusConfig = {
  "Pending Approval": { color: "orange" },
  Rejected: { color: "red" },
  "Payment Pending": { color: "gold" },
  Booked: { color: "blue" },
  CheckedIn: { color: "green" },
  CheckedOut: { color: "default" },
  Cancelled: { color: "red" },
};

export const roomTypeColor = {
  Single: "cyan",
  Double: "geekblue",
  Suite: "purple",
};

export const roomStatusColor = {
  Available: "green",
  Occupied: "red",
  Maintenance: "orange",
};

export const formatDate = (date) =>
  date ? dayjs(date).format("DD MMM YYYY") : "—";

export const getNights = (start, end) => {
  const nights = dayjs(end).diff(dayjs(start), "day");
  return `${nights} day${nights !== 1 ? "s" : ""}`;
};

export const getTotalCost = (booking) => {
  if (
    !booking?.room?.price ||
    !booking?.startDate ||
    !booking?.endDate
  ) {
    return 0;
  }

  const nights = dayjs(booking.endDate).diff(
    dayjs(booking.startDate),
    "day"
  );

  return nights * booking.room.price;
};

export const getPageTitle = (role) => {
  if (role === "Admin") return "All Bookings";
  if (role === "Manager") return "Member Bookings";
  return "My Bookings";
};
