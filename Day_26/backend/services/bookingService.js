const Room = require("../models/rooms");
const Booking = require("../models/booking");
const User = require("../models/user");
const Role = require("../models/role");
const { sendBookingNotification } = require("./emailService");
const logger = require("../config/logger");

// Creates service errors with an HTTP status for controller-level response handling.
const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Normalizes the current date to midnight for booking date validation.
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Booking emails are intentionally fire-and-forget so SMTP failures do not block status changes.
const sendBookingEmail = (type, booking) => {
  sendBookingNotification(type, booking).catch((error) => {
    logger.error(`Booking email failed (${type})`, error);
  });
};

// Finds rooms available for the requested dates while excluding active overlapping bookings.
const getAvailableRoomsForBooking = async ({ startDate, endDate } = {}) => {
  const query = {};

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw createServiceError("Invalid booking dates.", 400);
    }

    if (start < getToday() || end < getToday()) {
      throw createServiceError("Booking dates cannot be in the past.", 400);
    }

    if (end <= start) {
      throw createServiceError("End date must be after start date.", 400);
    }

    const bookedRoomIds = await Booking.find({
      bookingStatus: { $in: ["Pending Approval", "Booked", "CheckedIn"] },
      startDate: { $lt: end },
      endDate: { $gt: start },
    }).distinct("room");

    query._id = { $nin: bookedRoomIds };
  }

  return Room.find(query).select("roomNumber type price").sort({ roomNumber: 1 });
};

// Validates dates and room conflicts before creating a booking in Pending Approval state.
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

  const populatedBooking = await Booking.findById(booking._id)
    .populate("room")
    .populate({
      path: "user",
      select: "-password -refreshToken",
      populate: { path: "role" },
    });

  sendBookingEmail("created", populatedBooking);
  logger.info("Booking created successfully");

  return populatedBooking;
};

// Returns all bookings with room and user details for users who can view the full booking list.
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
    logger.error("Failed to fetch all bookings", error);
    throw new Error("Error fetching bookings: " + error.message);
  }
};

// Returns bookings belonging to users with the Member role for approval/review views.
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
    logger.error("Failed to fetch member bookings", error);
    throw new Error("Error fetching bookings: " + error.message);
  }
};

// Returns bookings owned by the current user plus bookings from users whose
// role is inside the current user's manageableRoles (same pattern as roleService).
const getBookingsForManageableRoles = async ({ userId, manageableRoleIds = [] }) => {
  try {
    const roleScopedUserIds = manageableRoleIds.length
      ? await User.find({ role: { $in: manageableRoleIds } }).distinct("_id")
      : [];

    const scopedUserIds = [
      ...new Set([userId.toString(), ...roleScopedUserIds.map(String)]),
    ];

    return await Booking.find({ user: { $in: scopedUserIds } })
      .populate("room")
      .populate({
        path: "user",
        select: "-password -refreshToken",
        populate: { path: "role" },
      })
      .sort({ createdAt: -1 });
  } catch (error) {
    logger.error("Failed to fetch manageable-role bookings", error);
    throw new Error("Error fetching bookings: " + error.message);
  }
};

// Returns only the bookings owned by the requested user.
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
    logger.error("Failed to fetch user bookings", error);
    throw new Error("Error fetching bookings: " + error.message);
  }
};

// Defines the allowed booking status transitions used by updateBooking.
const STATUS_TRANSITIONS = {
  "Pending Approval": ["Payment Pending", "Rejected", "Cancelled"],
  "Payment Pending": ["Booked", "Cancelled"],
  Booked: ["CheckedIn", "Cancelled"],
  CheckedIn: ["CheckedOut"],
  CheckedOut: [],
  Cancelled: [],
  Rejected: [],
};

// Updates permitted booking fields and sends a notification when the booking status changes.
const updateBooking = async (id, updateData) => {
  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      throw createServiceError("Booking not found", 404);
    }

    let statusChanged = false;

    if (updateData.bookingStatus) {
      const currentStatus = booking.bookingStatus;
      const nextStatus = updateData.bookingStatus;
      const allowedStatuses = STATUS_TRANSITIONS[currentStatus] || [];

      if (!allowedStatuses.includes(nextStatus)) {
        throw createServiceError(
          `Booking cannot be changed from '${currentStatus}' to '${nextStatus}'.`,
          409,
        );
      }

      booking.bookingStatus = nextStatus;
      statusChanged = currentStatus !== nextStatus;

      if (["Rejected", "Cancelled", "CheckedOut"].includes(nextStatus)) {
        booking.roomStatus = "Available";
      } else if (
        ["Pending Approval", "Payment Pending", "Booked", "CheckedIn"].includes(
          nextStatus,
        )
      ) {
        booking.roomStatus = "Occupied";
      }
    }

    const allowedFields = ["room", "startDate", "endDate", "roomStatus"];
    for (const field of allowedFields) {
      if (Object.hasOwn(updateData, field)) {
        booking[field] = updateData[field];
      }
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("room")
      .populate({
        path: "user",
        select: "-password -refreshToken",
        populate: { path: "role" },
      });

    if (statusChanged) {
      sendBookingEmail("status", updatedBooking);
    }

    logger.info("Booking updated successfully");
    return updatedBooking;
  } catch (error) {
    logger.error("Failed to update booking", error);
    if (error.statusCode) throw error;
    throw new Error("Error updating booking: " + error.message);
  }
};

// Deletes a booking by its identifier.
const deleteBooking = async (id) => {
  try {
    const booking = await Booking.findByIdAndDelete(id);
    logger.info("Booking deleted successfully");
    return booking;
  } catch (error) {
    logger.error("Failed to delete booking", error);
    throw new Error("Error deleting booking: " + error.message);
  }
};

module.exports = {
  getAvailableRoomsForBooking,
  varifyAndBookRoom,
  getAllBookings,
  getMemberBookings,
  getBookingsForManageableRoles,
  getBookingsByUserId,
  updateBooking,
  deleteBooking,
};
