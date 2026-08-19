const express = require("express");
const router = express.Router();

const {
  createRoom,
  getAllRooms,
  updateRoom,
  deleteRoom,
} = require("../../../controllers/roomsController");

const { requirePermission } = require("../../../middleware/permissionMiddleware");
const { validateRequest } = require("../../../middleware/validationHandler");
const {
  createRoomPayload,
  updateRoomPayload,
  roomIdPayload,
} = require("../../../validators/roomValidator");

// Get all rooms.
router.get("/",
  /*
   #swagger.tags = ['Rooms']
  */
  requirePermission("rooms", "view"), getAllRooms);

// Create a room after validating its details.
router.post("/new",
  /*
   #swagger.tags = ['Rooms']
  */
  requirePermission("rooms", "create"), createRoomPayload, validateRequest, createRoom);

// Update an existing room.
router.patch("/:id",
  /*
   #swagger.tags = ['Rooms']
  */
  requirePermission("rooms", "update"), updateRoomPayload, validateRequest, updateRoom);

// Delete a room by ID.
router.delete("/:id",
  /*
   #swagger.tags = ['Rooms']
  */
  requirePermission("rooms", "delete"), roomIdPayload, validateRequest, deleteRoom);

module.exports = router;
