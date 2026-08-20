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
const {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalServerError,
} = require("../utils/response");

const getPermission = (permissions, resource) =>
  permissions.find(
    (permission) => permission.resource?.toLowerCase() === resource,
  )?.action || {};

const canAccessBooking = (currentRole, bookingUserRole, userId, ownerId) => {
  if (String(userId) === String(ownerId)) return true;
  if (currentRole?.name === "Admin") return true;

  return (currentRole?.manageableRoles || []).some(
    (role) => String(role?._id || role) === String(bookingUserRole),
  );
};

const getAvailableRooms = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const rooms = await getAvailableRoomsForBooking({ startDate, endDate });
    logger.info("Available rooms fetched successfully");
    return ok(res, "Available rooms fetched successfully", { rooms });
  } catch (error) {
    logger.error("Failed to fetch available rooms", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error fetching available rooms");
    return internalServerError(res, error.message || "Error fetching available rooms");
  }
};

const bookRoom = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    if (!userId) return unauthorized(res, "Unauthorized: user not identified");

    const { roomId, startDate, endDate } = req.body;
    if (!roomId || !startDate || !endDate) {
      return badRequest(res, "roomId, startDate and endDate are required");
    }

    const booking = await varifyAndBookRoom({ roomId, userId, startDate, endDate });
    logger.info("Booking created successfully");
    return created(res, "Your booking request is created successfully and is pending approval.", { booking });
  } catch (error) {
    logger.error("Failed to create booking", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error booking room");
    if (statusCode === 409) return conflict(res, error.message || "Room is not available for the selected dates");
    return internalServerError(res, error.message || "Error booking room");
  }
};

const getBookings = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return unauthorized(res, "Unauthorized");

    const currentRole = req.user?.role;
    const permissions = currentRole?.permissions || [];
    const bookingActions = getPermission(permissions, "bookings");
    const manageableRoleIds = (currentRole?.manageableRoles || []).map(
      (role) => (typeof role === "object" ? role._id : role),
    );

    let bookings;
    if (currentRole?.name === "Admin") {
      bookings = await getAllBookings();
    } else if (bookingActions.view === true && manageableRoleIds.length > 0) {
      bookings = await getBookingsForManageableRoles({ userId, manageableRoleIds });
    } else {
      bookings = await getBookingsByUserId(userId);
    }

    logger.info("Bookings fetched successfully");
    return ok(res, "Bookings fetched successfully", { bookings });
  } catch (error) {
    logger.error("Failed to fetch bookings", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error fetching bookings");
    return internalServerError(res, error.message || "Error fetching bookings");
  }
};

const updateBookingHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const booking = await Booking.findById(id).populate("user", "role");
    if (!booking) return notFound(res, "Booking not found");

    const userPermissions = req.user?.role?.permissions || [];
    const bookingActions = getPermission(userPermissions, "bookings");
    const isOwner = booking.user._id.toString() === userId.toString();
    const canManageBooking = canAccessBooking(req.user?.role, booking.user.role, userId, booking.user._id);

    if (!canManageBooking || (!isOwner && bookingActions.update !== true)) {
      return forbidden(res, "Forbidden: You cannot update this booking");
    }

    const updatedBooking = await updateBooking(id, req.body);
    logger.info("Booking updated successfully");
    return ok(res, "Booking updated successfully", { booking: updatedBooking });
  } catch (error) {
    logger.error("Failed to update booking", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error updating booking");
    if (statusCode === 404) return notFound(res, error.message || "Booking not found");
    return internalServerError(res, error.message || "Error updating booking");
  }
};

const cancelBookingHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const booking = await Booking.findById(id).populate("user", "role");
    if (!booking) return notFound(res, "Booking not found");

    const bookingActions = getPermission(req.user?.role?.permissions || [], "bookings");
    const canManageBooking = canAccessBooking(req.user?.role, booking.user.role, userId, booking.user._id);
    if (!canManageBooking || bookingActions.update !== true) {
      return forbidden(res, "Forbidden: You cannot cancel this booking");
    }

    if (booking.bookingStatus === "Cancelled") {
      return conflict(res, "Booking is already cancelled");
    }

    if (["CheckedOut", "Rejected"].includes(booking.bookingStatus)) {
      return conflict(res, `Booking cannot be cancelled from '${booking.bookingStatus}' status`);
    }

    const cancelledBooking = await updateBooking(id, { bookingStatus: "Cancelled" });
    logger.info("Booking cancelled successfully");
    return ok(res, "Booking cancelled successfully", { booking: cancelledBooking });
  } catch (error) {
    logger.error("Failed to cancel booking", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error cancelling booking");
    if (statusCode === 404) return notFound(res, error.message || "Booking not found");
    if (statusCode === 409) return conflict(res, error.message || "Booking cannot be cancelled");
    return internalServerError(res, error.message || "Error cancelling booking");
  }
};

const deleteBookingHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const booking = await Booking.findById(id).populate("user", "role");
    if (!booking) return notFound(res, "Booking not found");

    const userPermissions = req.user?.role?.permissions || [];
    const bookingActions = getPermission(userPermissions, "bookings");
    if (bookingActions.delete !== true) {
      return forbidden(res, "Forbidden: You do not have permission to delete bookings");
    }

    const canManageBooking = canAccessBooking(req.user?.role, booking.user.role, userId, booking.user._id);
    if (!canManageBooking) return forbidden(res, "Forbidden: You cannot delete this booking");

    await deleteBooking(id);
    logger.info("Booking deleted successfully");
    return ok(res, "Booking deleted successfully");
  } catch (error) {
    logger.error("Failed to delete booking", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error deleting booking");
    if (statusCode === 404) return notFound(res, error.message || "Booking not found");
    if (statusCode === 403) return forbidden(res, error.message || "Forbidden");
    return internalServerError(res, error.message || "Error deleting booking");
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