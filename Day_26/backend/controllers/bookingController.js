const {
  getAvailableRoomsForBooking,
  varifyAndBookRoom,
  getAllBookings,
  getBookingsForManageableRoles,
  getBookingsByUserId,
  updateBooking,
  deleteBooking,
} = require("../services/bookingService");

const Booking = require("../models/booking");
const logger = require("../config/logger");

// Helper to extract action permissions for a specific module from the user's role.
const getPermission = (permissions, resource) =>
  permissions.find(
    (permission) => permission.resource?.toLowerCase() === resource,
  )?.action || {};

// Check whether the current user owns or can manage the booking's role.
const canAccessBooking = (currentRole, bookingUserRole, userId, ownerId) => {
  if (String(userId) === String(ownerId)) return true;
  if (currentRole?.name === "Admin") return true;

  return (currentRole?.manageableRoles || []).some(
    (role) => String(role?._id || role) === String(bookingUserRole),
  );
};

// Returns rooms that do not have conflicting active bookings for the specified date range.
const getAvailableRooms = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const rooms = await getAvailableRoomsForBooking({ startDate, endDate });
    logger.info("Available rooms fetched successfully");

    return res.status(200).json({
      message: "Available rooms fetched successfully",
      rooms,
    });
  } catch (error) {
    logger.error("Failed to fetch available rooms", error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error fetching available rooms",
    });
  }
};

// Validates dates and availability, then creates a new booking in Pending status.
const bookRoom = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user not identified" });
    }

    const { roomId, startDate, endDate } = req.body;

    if (!roomId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "roomId, startDate and endDate are required" });
    }

    // Verify room availability before creating the booking record.
    const booking = await varifyAndBookRoom({
      roomId,
      userId,
      startDate,
      endDate,
    });
    logger.info("Booking created successfully");

    return res.status(201).json({
      message:
        "Your booking request is created successfully and is pending approval.",
      booking,
    });
  } catch (error) {
    logger.error("Failed to create booking", error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error booking room",
    });
  }
};

// Returns only the current user's bookings or bookings from manageable roles.
const getBookings = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentRole = req.user?.role;
    const permissions = currentRole?.permissions || [];
    const bookingActions = getPermission(permissions, "bookings");
    const manageableRoleIds = (currentRole?.manageableRoles || []).map(
      (role) => (typeof role === "object" ? role._id : role),
    );

    // Use manageableRoles only when the current role can view bookings.
    const canViewManageableBookings =
      bookingActions.view === true &&
      (currentRole?.name === "Admin" || manageableRoleIds.length > 0);

    let bookings;
    if (canViewManageableBookings) {
      bookings = await getBookingsForManageableRoles({
        userId,
        manageableRoleIds:
          currentRole?.name === "Admin" ? [] : manageableRoleIds,
      });
    } else {
      bookings = await getBookingsByUserId(userId);
    }

    logger.info("Bookings fetched successfully");
    return res.status(200).json({
      message: "Bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    logger.error("Failed to fetch bookings", error);
    return res.status(500).json({
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

const updateBookingHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const booking = await Booking.findById(id).populate("user", "role");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userPermissions = req.user?.role?.permissions || [];
    const bookingActions = getPermission(userPermissions, "bookings");
    const isOwner = booking.user._id.toString() === userId.toString();
    const canManageBooking = canAccessBooking(
      req.user?.role,
      booking.user.role,
      userId,
      booking.user._id,
    );

    if (!canManageBooking || (!isOwner && bookingActions.update !== true)) {
      return res.status(403).json({
        message: "Forbidden: You cannot update this booking",
      });
    }

    const updatedBooking = await updateBooking(id, req.body);
    logger.info("Booking updated successfully");
    return res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    logger.error("Failed to update booking", error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error updating booking",
    });
  }
};

// Cancels a booking by changing its status so the booking history remains available.
const cancelBookingHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const booking = await Booking.findById(id).populate("user", "role");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bookingActions = getPermission(
      req.user?.role?.permissions || [],
      "bookings",
    );
    const isOwner = booking.user._id.toString() === userId.toString();
    const canManageBooking = canAccessBooking(
      req.user?.role,
      booking.user.role,
      userId,
      booking.user._id,
    );

    if (!canManageBooking || bookingActions.update !== true) {
      return res.status(403).json({
        message: "Forbidden: You cannot cancel this booking",
      });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(409).json({ message: "Booking is already cancelled" });
    }

    if (["CheckedOut", "Rejected"].includes(booking.bookingStatus)) {
      return res.status(409).json({
        message: `Booking cannot be cancelled from '${booking.bookingStatus}' status`,
      });
    }

    const cancelledBooking = await updateBooking(id, {
      bookingStatus: "Cancelled",
    });

    logger.info("Booking cancelled successfully");
    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking: cancelledBooking,
    });
  } catch (error) {
    logger.error("Failed to cancel booking", error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error cancelling booking",
    });
  }
};

const deleteBookingHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const booking = await Booking.findById(id).populate("user", "role");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userPermissions = req.user?.role?.permissions || [];
    const bookingActions = getPermission(userPermissions, "bookings");
    const isOwner = booking.user._id.toString() === userId.toString();
    const canManageBooking = canAccessBooking(
      req.user?.role,
      booking.user.role,
      userId,
      booking.user._id,
    );

    if (!canManageBooking || (!isOwner && bookingActions.delete !== true)) {
      return res.status(403).json({
        message: "Forbidden: You cannot delete this booking",
      });
    }

    await deleteBooking(id);
    logger.info("Booking deleted successfully");
    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    logger.error("Failed to delete booking", error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error deleting booking",
    });
  }
};

module.exports = {
  getAvailableRooms,
  bookRoom,
  getBookings,
  updateBookingHandler,
  cancelBookingHandler,
  deleteBookingHandler,
};