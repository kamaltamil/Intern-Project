const express = require("express");

const router = express.Router();

const {
  createRoom,
  getAllRooms,
  deleteRoom,
} = require("../../../controllers/roomsController");

const {
  requirePermission,
} = require(
  "../../../middleware/permissionMiddleware"
);

/* -------------------------------------------------------------------------- */
/*                              Get Rooms                                     */
/* -------------------------------------------------------------------------- */

/*
 * Any authenticated user can view rooms.
 *
 * This is required because members need to
 * see available rooms before booking.
 */
router.get(
  "/",
  getAllRooms
);

/* -------------------------------------------------------------------------- */
/*                              Create Room                                   */
/* -------------------------------------------------------------------------- */

router.post(
  "/new",
  requirePermission(
    "rooms",
    "create"
  ),
  createRoom
);

/* -------------------------------------------------------------------------- */
/*                              Delete Room                                   */
/* -------------------------------------------------------------------------- */

router.delete(
  "/:id",
  requirePermission(
    "rooms",
    "delete"
  ),
  deleteRoom
);

module.exports = router;