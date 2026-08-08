const Room = require("../models/rooms");
const Booking = require("../models/booking");
const User = require("../models/user");
const Role = require("../models/role");

const varifyAndBookRoom = async ({ roomId, userId, startDate, endDate }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new Error("Invalid date range");
  }

  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  const roomIsBooked = await Booking.findOne({
    room: roomId,
    bookingStatus: { $in: ["Booked", "CheckedIn"] },
    startDate: { $lt: end },
    endDate: { $gt: start },
  });

  if (roomIsBooked) {
    throw new Error("Room is already booked");
  }

  const booking = await Booking.create({
    room: roomId,
    user: userId,
    startDate: startDate,
    endDate: endDate,
    roomStatus: "Occupied",
    bookingStatus: "Payment Pending",
  });

  return await Booking.findById(booking._id)
    .populate("room")
    .populate({
      path: "user",
      select: "-password -refreshToken",
      populate: { path: "role" },
    });
};

const getAllBookings = async () => {
  try {
    const bookings = await Booking.find()
      .populate("room")
      .populate({
        path: "user",
        select: "-password -refreshToken",
        populate: { path: "role" },
      })
      .sort({ createdAt: -1 });

    return bookings;
  } catch (error) {
    throw new Error("Error fetching bookings: " + error.message);
  }
};

const getMemberBookings = async () => {
  try {
    const memberRole = await Role.findOne({ name: "Member" });
    const memberIds = memberRole
      ? await User.find({ role: memberRole._id }).distinct("_id")
      : [];

    const bookings = await Booking.find({ user: { $in: memberIds } })
      .populate("room")
      .populate({
        path: "user",
        select: "-password -refreshToken",
        populate: { path: "role" },
      })
      .sort({ createdAt: -1 });

    return bookings;
  } catch (error) {
    throw new Error("Error fetching bookings: " + error.message);
  }
};

const getBookingsByUserId = async (userId) => {
  try {
    const bookings = await Booking.find({ user: userId })
      .populate("room")
      .populate({
        path: "user",
        select: "-password -refreshToken",
        populate: { path: "role" },
      })
      .sort({ createdAt: -1 });

    return bookings;
  } catch (error) {
    throw new Error("Error fetching bookings: " + error.message);
  }
};

const updateBooking = async (id, updateData) => {
  try {
    const booking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("room")
      .populate({
        path: "user",
        select: "-password -refreshToken",
        populate: { path: "role" },
      });

    return booking;
  } catch (error) {
    throw new Error("Error updating booking: " + error.message);
  }
};

const deleteBooking = async (id) => {
  try {
    const booking = await Booking.findByIdAndDelete(id);
    return booking;
  } catch (error) {
    throw new Error("Error deleting booking: " + error.message);
  }
};

module.exports = {
  varifyAndBookRoom,
  getAllBookings,
  getMemberBookings,
  getBookingsByUserId,
  updateBooking,
  deleteBooking,
};