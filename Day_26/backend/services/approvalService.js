const Booking = require("../models/booking");
const { sendBookingNotification } = require("./emailService");

const populateBooking = (query) =>
  query
    .populate("room")
    .populate({
      path: "user",
      select: "-password -refreshToken",
      populate: { path: "role", select: "name color" },
    });

const sendApprovalEmail = (type, booking) => {
  sendBookingNotification(type, booking).catch((error) => {
    console.error(`Booking email failed (${type}):`, error.message);
  });
};

const getPendingApprovals = async () => {
  return populateBooking(
    Booking.find({ bookingStatus: "Pending Approval" }).sort({
      startDate: 1,
    })
  );
};

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

  return updatedBooking;
};

module.exports = {
  getPendingApprovals,
  changeApprovalStatus,
};
