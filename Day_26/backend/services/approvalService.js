const Booking = require("../models/booking");
const { sendBookingNotification } = require("./emailService");
const logger = require("../config/logger");

const populateBooking = (query) =>
  query
    .populate("room")
    .populate({
      path: "user",
      select: "-password -refreshToken",
      populate: { path: "role", select: "name color" },
    });

// Sends approval-related notifications without making email delivery part of the booking response.
const sendApprovalEmail = (type, booking) => {
  sendBookingNotification(type, booking).catch((error) => {
    logger.error(`Booking email failed (${type})`, error);
  });
};

// Returns bookings that are waiting for an approval decision.
const getPendingApprovals = async () => {
  return populateBooking(
    Booking.find({ bookingStatus: "Pending Approval" }).sort({
      startDate: 1,
    })
  );
};

// Applies the existing approval/rejection transition and returns the populated booking.
const changeApprovalStatus = async (id, decision) => {
  const booking = await Booking.findById(id);

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (booking.bookingStatus !== "Pending Approval") {
    const error = new Error(
      `Booking cannot be ${decision.toLowerCase()} from '${booking.bookingStatus}' status.`
    );
    error.statusCode = 409;
    throw error;
  }

  const nextStatus = decision === "approve" ? "Payment Pending" : "Rejected";

  booking.bookingStatus = nextStatus;
  booking.roomStatus = nextStatus === "Rejected" ? "Available" : "Occupied";

  await booking.save();

  const updatedBooking = await populateBooking(Booking.findById(booking._id));
  sendApprovalEmail(decision === "approve" ? "approved" : "rejected", updatedBooking);
  logger.info(`Booking ${decision}d successfully`);

  return updatedBooking;
};

module.exports = {
  getPendingApprovals,
  changeApprovalStatus,
};
