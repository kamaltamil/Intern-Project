const {
  getAvailableRoomsForBooking,
  varifyAndBookRoom,
  getAllBookings,
  getMemberBookings,
  getBookingsByUserId,
  updateBooking,
  deleteBooking,
} = require("../services/bookingService");

const Booking = require("../models/booking");

// Helper to extract action permissions for a specific module from the user's role.
const getPermission = (permissions, resource) =>
  permissions.find(
    (permission) => permission.resource?.toLowerCase() === resource,
  )?.action || {};

// Returns rooms that do not have conflicting active bookings for the specified date range.
const getAvailableRooms = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const rooms = await getAvailableRoomsForBooking({ startDate, endDate });

    return res.status(200).json({
      message: "Available rooms fetched successfully",
      rooms,
    });
  } catch (error) {
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
      return res.status(401).json({ message: "Unauthorized: user not identified" });
    }

    const { roomId, startDate, endDate } = req.body;

    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({ message: "roomId, startDate and endDate are required" });
    }

    // Verify room availability before creating the booking record.
    const booking = await varifyAndBookRoom({ roomId, userId, startDate, endDate });

    return res.status(201).json({
      message: "Your booking request is created successfully and is pending approval.",
      booking,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error booking room",
    });
  }
};

// Returns bookings scoped by role: Admins see all, Managers see member bookings, Members see only their own.
const getBookings = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const permissions = req.user?.role?.permissions || [];
    const bookingActions = getPermission(permissions, "bookings");
    const approvalActions = getPermission(permissions, "approval");
    const userActions = getPermission(permissions, "users");

    // Admins and managers with user view permission can inspect all bookings.
    const canViewAll =
      bookingActions.delete === true || userActions.view === true;
    const canReviewMemberBookings = approvalActions.view === true;

    let bookings;
    if (canViewAll) {
      bookings = await getAllBookings();
    } else if (canReviewMemberBookings) {
      bookings = await getMemberBookings();
    } else {
      bookings = await getBookingsByUserId(userId);
    }

    return res.status(200).json({
      message: "Bookings fetched successfully",
      bookings,
    });
  } catch (error) {
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
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userPermissions = req.user?.role?.permissions || [];
    const bookingActions = getPermission(userPermissions, "bookings");
    const isOwner = booking.user.toString() === userId.toString();

    if (!isOwner && bookingActions.update !== true) {
      return res.status(403).json({
        message: "Forbidden: You cannot update another user's booking",
      });
    }

    const updatedBooking = await updateBooking(id, req.body);
    return res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error updating booking",
    });
  }
};

const deleteBookingHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userPermissions = req.user?.role?.permissions || [];
    const bookingActions = getPermission(userPermissions, "bookings");
    const isOwner = booking.user.toString() === userId.toString();

    if (!isOwner && bookingActions.delete !== true) {
      return res.status(403).json({
        message: "Forbidden: You cannot delete another user's booking",
      });
    }

    await deleteBooking(id);
    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
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
  deleteBookingHandler,
};
