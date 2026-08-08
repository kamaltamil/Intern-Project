const {
  varifyAndBookRoom,
  getAllBookings,
  getMemberBookings,
  getBookingsByUserId,
  updateBooking,
  deleteBooking,
} = require("../services/bookingService");

const Booking = require("../models/booking");

/**
 * Book a room
 */
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

    const booking = await varifyAndBookRoom({ roomId, userId, startDate, endDate });

    if (!booking) {
      return res.status(400).json({ message: "Booking failed" });
    }

    return res.status(201).json({
      message: "Your booking is created successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error booking room" });
  }
};

/**
 * Get bookings
 *
 * Permission-driven scoping based on database permissions:
 * - bookings.delete or bookings.update -> sees all bookings
 * - approval.view -> sees member bookings
 * - otherwise -> sees only own bookings
 */
const getBookings = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userPermissions = req.user?.role?.permissions || [];

    const bookingPerm = userPermissions.find(
      (p) => p.resource?.toLowerCase() === "bookings"
    );
    const bookingAct = bookingPerm?.action || {};

    const approvalPerm = userPermissions.find(
      (p) => p.resource?.toLowerCase() === "approval"
    );
    const approvalAct = approvalPerm?.action || {};

    const canViewAll =
      bookingAct.delete === true ||
      bookingAct.update === true;

    const canReview = approvalAct.view === true;

    let bookings;
    if (canViewAll) {
      bookings = await getAllBookings();
    } else if (canReview) {
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

/**
 * Update booking
 */
const updateBookingHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const userPermissions = req.user?.role?.permissions || [];

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.user.toString() === userId.toString();

    const bookingPerm = userPermissions.find(
      (p) => p.resource?.toLowerCase() === "bookings"
    );
    const canUpdateAny = bookingPerm?.action?.update === true;

    if (!isOwner && !canUpdateAny) {
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
    return res.status(500).json({
      message: error.message || "Error updating booking",
    });
  }
};

/**
 * Delete booking
 */
const deleteBookingHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const userPermissions = req.user?.role?.permissions || [];

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.user.toString() === userId.toString();

    const bookingPerm = userPermissions.find(
      (p) => p.resource?.toLowerCase() === "bookings"
    );
    const canDeleteAny = bookingPerm?.action?.delete === true;

    if (!isOwner && !canDeleteAny) {
      return res.status(403).json({
        message: "Forbidden: You cannot delete another user's booking",
      });
    }

    await deleteBooking(id);

    return res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error deleting booking",
    });
  }
};

module.exports = {
  bookRoom,
  getBookings,
  updateBookingHandler,
  deleteBookingHandler,
};