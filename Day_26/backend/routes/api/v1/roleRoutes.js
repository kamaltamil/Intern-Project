const express = require("express");
const router = express.Router();

const {
  createRoleHandler,
  listRoles,
  getRoleHandler,
  updateRoleHandler,
  deleteRoleHandler,
} = require("../../../controllers/roleController");

const { authenticateToken, requireRole } = require("../../../middleware/auth");

/**
 * Admin only
 */

// Get all roles
router.get("/", authenticateToken, requireRole("Admin"), listRoles);

// Get single role
router.get("/:id", authenticateToken, requireRole("Admin"), getRoleHandler);

// Create role
router.post("/", authenticateToken, requireRole("Admin"), createRoleHandler);

// Update role
router.patch(
  "/:id",
  authenticateToken,
  requireRole("Admin"),
  updateRoleHandler,
);

// Delete role
router.delete(
  "/:id",
  authenticateToken,
  requireRole("Admin"),
  deleteRoleHandler,
);

module.exports = router;
