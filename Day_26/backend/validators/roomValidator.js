const { body, param } = require("express-validator");

// Validate room details before creating or updating inventory records.
const createRoomPayload = [
  body("roomNumber").trim().notEmpty().withMessage("Room number is required"),
  body("type").trim().notEmpty().withMessage("Room type is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
];

const updateRoomPayload = [
  param("id").isMongoId().withMessage("Invalid room ID"),
  body("roomNumber").optional().trim().notEmpty().withMessage("Room number cannot be empty"),
  body("type").optional().trim().notEmpty().withMessage("Room type cannot be empty"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
];

const roomIdPayload = [param("id").isMongoId().withMessage("Invalid room ID")];

module.exports = { createRoomPayload, updateRoomPayload, roomIdPayload };
