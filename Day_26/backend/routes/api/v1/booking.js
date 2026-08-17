const express = require("express");

const router = express.Router();

const {
  getAvailableRooms,
  bookRoom,
  getBookings,
  updateBookingHandler,
  deleteBookingHandler,
} = require("../../../controllers/bookingController");

const { requirePermission,} = require("../../../middleware/permissionMiddleware");

router.get("/available-rooms", requirePermission("bookings", "create"),  getAvailableRooms,);

router.get("/", requirePermission("bookings", "view"),  getBookings,);

router.post("/new", requirePermission("bookings", "create"),  bookRoom,);

router.patch("/:id", requirePermission("bookings", "update"),  updateBookingHandler,);

router.delete("/:id", requirePermission("bookings", "delete"),  deleteBookingHandler,);

module.exports = router;
