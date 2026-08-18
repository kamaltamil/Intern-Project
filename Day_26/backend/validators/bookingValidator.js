const { body, param, query } = require("express-validator");

// Validate the booking dates and room reference before the booking service runs.
const createBookingPayload = [
  body("roomId").isMongoId().withMessage("Invalid room ID"),
  body("startDate").isISO8601().withMessage("Invalid start date"),
  body("endDate").isISO8601().withMessage("Invalid end date"),
];

const bookingIdPayload = [
  param("id").isMongoId().withMessage("Invalid booking ID"),
];

const availabilityPayload = [
  query("startDate").isISO8601().withMessage("Invalid start date"),
  query("endDate").isISO8601().withMessage("Invalid end date"),
];

const updateBookingPayload = [
  param("id").isMongoId().withMessage("Invalid booking ID"),
];

module.exports = {
  createBookingPayload,
  bookingIdPayload,
  availabilityPayload,
  updateBookingPayload,
};
