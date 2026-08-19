const express = require("express");
const router = express.Router();

const {
  getPending,
  approveBooking,
  rejectBooking,
} = require("../../../controllers/approvalController");
const { requirePermission } = require("../../../middleware/permissionMiddleware");

router.get("/", 
  /*
  #swagger.tags = ['BookingApproval']
  */
  requirePermission("approval", "view"), getPending);
router.patch("/:id/approve", 
  /*
  #swagger.tags = ['BookingApproval']
  */
  requirePermission("approval", "update"), approveBooking);
router.patch("/:id/reject", 
  /*
  #swagger.tags = ['BookingApproval']
  */
  requirePermission("approval", "update"), rejectBooking);

module.exports = router;
