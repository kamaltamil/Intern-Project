const express = require("express");
const router = express.Router();

const {
  getAvailableRooms,
  bookRoom,
  getBookings,
  updateBookingHandler,
  cancelBookingHandler,
  deleteBookingHandler,
} = require("../../../controllers/bookingController");

const { requirePermission } = require("../../../middleware/permissionMiddleware");
const { validateRequest } = require("../../../middleware/validationHandler");
const {
  createBookingPayload,
  bookingIdPayload,
  availabilityPayload,
  updateBookingPayload,
} = require("../../../validators/bookingValidator");

// Get rooms available for the requested date range.
router.get("/available-rooms", requirePermission("bookings", "create"), getAvailableRooms);

// Get bookings visible to the authenticated user.
router.get("/", requirePermission("bookings", "view"), getBookings);

// Create a new booking request.
router.post("/new", requirePermission("bookings", "create"), createBookingPayload, validateRequest, bookRoom);

// Update an existing booking.
router.patch("/:id", requirePermission("bookings", "update"), updateBookingPayload, validateRequest, updateBookingHandler);

// Cancel a booking without removing its history.
router.patch("/:id/cancel", requirePermission("bookings", "update"), bookingIdPayload, validateRequest, cancelBookingHandler);

// Delete an existing booking.
router.delete("/:id", requirePermission("bookings", "delete"), bookingIdPayload, validateRequest, deleteBookingHandler);

module.exports = router;
