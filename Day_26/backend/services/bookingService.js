const Room = require("../models/rooms");
const Booking = require("../models/booking");
const User = require("../models/user");
const Role = require("../models/role");

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const varifyAndBookRoom = async ({ roomId, userId, startDate, endDate }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = getToday();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw createServiceError("Invalid booking dates.", 400);
  }

  if (start < today || end < today) {
    throw createServiceError("Booking dates cannot be in the past.", 400);
  }

  if (end <= start) {
    throw createServiceError("End date must be after start date.", 400);
  }

  const room = await Room.findById(roomId);
  if (!room) {
    throw createServiceError("Room not found", 404);
  }

  const conflictingBooking = await Booking.findOne({
    room: roomId,
    bookingStatus: { $in: ["Pending Approval", "Booked", "CheckedIn"] },
    startDate: { $lt: end },
    endDate: { $gt: start },
  });

  if (conflictingBooking) {
    throw createServiceError("The room is unavailable.", 409);
  }

  const booking = await Booking.create({
    room: roomId,
    user: userId,
    startDate: start,
    endDate: end,
    roomStatus: "Occupied",
    bookingStatus: "Pending Approval",
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
    return await Booking.find()
      .populate("room")
      .populate({
        path: "user",
        select: "-password -refreshToken",
        populate: { path: "role" },
      })
      .sort({ createdAt: -1 });
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

    return await Booking.find({ user: { $in: memberIds } })
      .populate("room")
      .populate({
        path: "user",
        select: "-password -refreshToken",
        populate: { path: "role" },
      })
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Error fetching bookings: " + error.message);
  }
};

const getBookingsByUserId = async (userId) => {
  try {
    return await Booking.find({ user: userId })
      .populate("room")
      .populate({
        path: "user",
        select: "-password -refreshToken",
        populate: { path: "role" },
      })
      .sort({ createdAt: -1 });
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
    return await Booking.findByIdAndDelete(id);
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