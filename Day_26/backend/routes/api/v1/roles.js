const express = require("express");

const router = express.Router();

const {
  createRoleHandler,
  listRoles,
  getRole,
  updateRoleHandler,
  deleteRoleHandler,
} = require("../../../controllers/roleController");

const {
  hasPermission,
} = require("../../../middleware/auth");

/* -------------------------------------------------------------------------- */
/*                               Get All Roles                                */
/* -------------------------------------------------------------------------- */

router.get(
  "/",
  listRoles
);

/* -------------------------------------------------------------------------- */
/*                              Get Single Role                               */
/* -------------------------------------------------------------------------- */

router.get(
  "/:id",
  hasPermission("roles", "view"),
  getRole
);

/* -------------------------------------------------------------------------- */
/*                                Create Role                                 */
/* -------------------------------------------------------------------------- */

router.post(
  "/",
  hasPermission("roles", "create"),
  createRoleHandler
);

/* -------------------------------------------------------------------------- */
/*                                Update Role                                 */
/* -------------------------------------------------------------------------- */

router.patch(
  "/:id",
  hasPermission("roles", "update"),
  updateRoleHandler
);

/* -------------------------------------------------------------------------- */
/*                                Delete Role                                 */
/* -------------------------------------------------------------------------- */

router.delete(
  "/:id",
  hasPermission("roles", "delete"),
  deleteRoleHandler
);

module.exports = router;