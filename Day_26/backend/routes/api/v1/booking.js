const express = require("express");

const router = express.Router();

const {
  bookRoom,
  getBookings,
  updateBookingHandler,
  deleteBookingHandler,
} = require("../../../controllers/bookingController");

const {
  requirePermission,
} = require("../../../middleware/permissionMiddleware");

/*
|--------------------------------------------------------------------------
| BOOKING ROUTES
|--------------------------------------------------------------------------
|
| authenticateToken is applied at the mount point in api.js
|
| Permission structure:
|   bookings.view   — list bookings
|   bookings.create — create booking
|   bookings.update — update booking
|   bookings.delete — delete booking
|
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  requirePermission("bookings", "view"),
  getBookings
);

router.post(
  "/new",
  requirePermission("bookings", "create"),
  bookRoom
);

router.patch(
  "/:id",
  requirePermission("bookings", "update"),
  updateBookingHandler
);

router.delete(
  "/:id",
  requirePermission("bookings", "delete"),
  deleteBookingHandler
);

module.exports = router;