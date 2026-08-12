const express = require("express");
const router = express.Router();

const {
  getPending,
  approveBooking,
  rejectBooking,
} = require("../../../controllers/approvalController");
const { requirePermission } = require("../../../middleware/permissionMiddleware");

router.get("/", requirePermission("approval", "view"), getPending);
router.patch("/:id/approve", requirePermission("approval", "update"), approveBooking);
router.patch("/:id/reject", requirePermission("approval", "update"), rejectBooking);

module.exports = router;
