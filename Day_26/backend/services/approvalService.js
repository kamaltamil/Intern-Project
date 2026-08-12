const Booking = require("../models/booking");

const populateBooking = (query) =>
  query
    .populate("room")
    .populate({
      path: "user",
      select: "-password -refreshToken",
      populate: { path: "role", select: "name color" },
    });

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

  if (nextStatus === "Rejected") {
    booking.roomStatus = "Available";
  } else {
    booking.roomStatus = "Occupied";
  }

  await booking.save();

  return populateBooking(Booking.findById(booking._id));
};

module.exports = {
  getPendingApprovals,
  changeApprovalStatus,
};
