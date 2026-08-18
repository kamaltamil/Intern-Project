const express = require("express");

const router = express.Router();

const {
  createRoleHandler,
  listRoles,
  getRole,
  updateRoleHandler,
  deleteRoleHandler,
} = require("../../../controllers/roleController");

const { hasPermission } = require("../../../middleware/auth");
const { validateRequest } = require("../../../middleware/validationHandler");
const {
  createRolePayload,
  updateRolePayload,
  roleIdPayload,
} = require("../../../validators/roleValidator");

// Get all roles.
router.get("/", listRoles);

// Get a single role by ID.
router.get("/:id", hasPermission("roles", "view"), roleIdPayload, validateRequest, getRole);

// Create a role with the supplied permissions.
router.post("/", hasPermission("roles", "create"), createRolePayload, validateRequest, createRoleHandler);

// Update a role and its permissions.
router.patch("/:id", hasPermission("roles", "update"), updateRolePayload, validateRequest, updateRoleHandler);

// Delete a role by ID.
router.delete("/:id", hasPermission("roles", "delete"), roleIdPayload, validateRequest, deleteRoleHandler);

module.exports = router;
