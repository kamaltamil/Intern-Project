const express = require("express");
const router = express.Router();

const {
  createRoom,
  getAllRooms,
  updateRoom,
  deleteRoom,
} = require("../../../controllers/roomsController");

const { requirePermission } = require("../../../middleware/permissionMiddleware");

router.get("/", requirePermission("rooms", "view"), getAllRooms);
router.post("/new", requirePermission("rooms", "create"), createRoom);
router.patch("/:id", requirePermission("rooms", "update"), updateRoom);
router.delete("/:id", requirePermission("rooms", "delete"), deleteRoom);

module.exports = router;
