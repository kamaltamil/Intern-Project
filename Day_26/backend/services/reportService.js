const Booking = require("../models/booking");
const User = require("../models/user");
const Room = require("../models/rooms");

const ACTIVE_STATUSES = new Set([
  "Pending Approval",
  "Payment Pending",
  "Booked",
  "CheckedIn",
]);

const REVENUE_STATUSES = new Set(["Booked", "CheckedIn", "CheckedOut"]);

// Converts a date into the year-month key used by monthly report statistics.
const getMonthKey = (date) => {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
};

// Formats a report month as a short human-readable label.
const getMonthLabel = (date) =>
  new Intl.DateTimeFormat("en", { month: "short" }).format(date);

// Creates six month buckets used for booking and revenue trends.
const getLastSixMonths = () => {
  const months = [];
  const now = new Date();

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push({ key: getMonthKey(date), label: getMonthLabel(date), bookings: 0, revenue: 0 });
  }

  return months;
};

// Collects booking, user, room, status, revenue, and usage information for reports.
const getReports = async () => {
  const [bookings, totalUsers, activeUsers, totalRooms] = await Promise.all([
    Booking.find().populate("room", "roomNumber type price").populate("user", "name username email").sort({ createdAt: -1 }),
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Room.countDocuments(),
  ]);

  const statusCounts = {
    "Pending Approval": 0,
    Rejected: 0,
    "Payment Pending": 0,
    Booked: 0,
    CheckedIn: 0,
    CheckedOut: 0,
    Cancelled: 0,
  };

  let revenue = 0;
  const roomUsage = new Map();
  const monthlyStats = getLastSixMonths();
  const monthlyStatsMap = new Map(monthlyStats.map((item) => [item.key, item]));

  for (const booking of bookings) {
    statusCounts[booking.bookingStatus] = (statusCounts[booking.bookingStatus] || 0) + 1;
    const nights = Math.max(0, Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / 86400000));
    const bookingRevenue = REVENUE_STATUSES.has(booking.bookingStatus) ? nights * Number(booking.room?.price || 0) : 0;
    revenue += bookingRevenue;

    const month = monthlyStatsMap.get(getMonthKey(booking.createdAt));
    if (month) {
      month.bookings += 1;
      month.revenue += bookingRevenue;
    }

    if (booking.room?._id) {
      const key = String(booking.room._id);
      const current = roomUsage.get(key) || { roomId: key, roomNumber: booking.room.roomNumber, type: booking.room.type, bookings: 0, nights: 0 };
      current.bookings += 1;
      if (ACTIVE_STATUSES.has(booking.bookingStatus)) current.nights += nights;
      roomUsage.set(key, current);
    }
  }

  const reportBookings = bookings.map((booking) => ({
    _id: booking._id,
    room: booking.room,
    user: booking.user,
    startDate: booking.startDate,
    endDate: booking.endDate,
    roomStatus: booking.roomStatus,
    bookingStatus: booking.bookingStatus,
  }));

  const bookingValue = bookings.length ? revenue / bookings.length : 0;

  return {
    summary: {
      totalBookings: bookings.length,
      activeBookings: bookings.filter((booking) => ACTIVE_STATUSES.has(booking.bookingStatus)).length,
      completedBookings: statusCounts.CheckedOut,
      cancelledBookings: statusCounts.Cancelled,
      rejectedBookings: statusCounts.Rejected,
      revenue,
      averageBookingValue: bookingValue,
      totalUsers,
      activeUsers,
      totalRooms,
    },
    statusCounts,
    monthlyStats,
    roomUsage: Array.from(roomUsage.values()).sort((a, b) => b.nights - a.nights),
    bookings: reportBookings,
  };
};

module.exports = { getReports };
