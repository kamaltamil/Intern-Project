const Booking = require("../models/booking");

const ACTIVE_STATUSES = ["Pending Approval", "Payment Pending", "Booked", "CheckedIn"];

const getReports = async () => {
  const bookings = await Booking.find()
    .populate("room", "roomNumber type price")
    .populate("user", "name username email")
    .sort({ createdAt: -1 });

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

  for (const booking of bookings) {
    statusCounts[booking.bookingStatus] =
      (statusCounts[booking.bookingStatus] || 0) + 1;

    const nights = Math.max(
      0,
      Math.ceil(
        (new Date(booking.endDate) - new Date(booking.startDate)) /
          86400000,
      ),
    );

    if (["Booked", "CheckedIn", "CheckedOut"].includes(booking.bookingStatus)) {
      revenue += nights * Number(booking.room?.price || 0);
    }

    if (booking.room?._id) {
      const key = String(booking.room._id);
      const current = roomUsage.get(key) || {
        roomId: key,
        roomNumber: booking.room.roomNumber,
        type: booking.room.type,
        bookings: 0,
        nights: 0,
      };
      current.bookings += 1;
      if (ACTIVE_STATUSES.includes(booking.bookingStatus)) {
        current.nights += nights;
      }
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

  return {
    summary: {
      totalBookings: bookings.length,
      activeBookings: bookings.filter((b) =>
        ACTIVE_STATUSES.includes(b.bookingStatus),
      ).length,
      completedBookings: statusCounts.CheckedOut,
      cancelledBookings: statusCounts.Cancelled,
      rejectedBookings: statusCounts.Rejected,
      revenue,
    },
    statusCounts,
    roomUsage: Array.from(roomUsage.values()).sort(
      (a, b) => b.nights - a.nights,
    ),
    bookings: reportBookings,
  };
};

module.exports = { getReports };
