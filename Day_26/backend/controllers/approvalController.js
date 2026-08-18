const {
  getPendingApprovals,
  changeApprovalStatus,
} = require("../services/approvalService");
const logger = require("../config/logger");

// Return only pending bookings that belong to roles the current user can manage.
const getPending = async (req, res) => {
  try {
    const bookings = await getPendingApprovals(req.user?.role);
    logger.info("Pending booking approvals fetched successfully");
    return res.status(200).json({ message: "Pending bookings fetched successfully", bookings });
  } catch (error) {
    logger.error("Failed to fetch pending booking approvals", error);
    return res.status(error.statusCode || 500).json({ message: error.message || "Error fetching pending bookings" });
  }
};

// Approves a pending booking after checking the target user's manageable role.
const approveBooking = async (req, res) => {
  try {
    const booking = await changeApprovalStatus(req.params.id, "approve", req.user?.role);
    logger.info("Booking approved successfully");
    return res.status(200).json({ message: "Booking approved. Payment is now pending.", booking });
  } catch (error) {
    logger.error("Failed to approve booking", error);
    return res.status(error.statusCode || 500).json({ message: error.message || "Error approving booking" });
  }
};

// Rejects a pending booking after checking the target user's manageable role.
const rejectBooking = async (req, res) => {
  try {
    const booking = await changeApprovalStatus(req.params.id, "reject", req.user?.role);
    logger.info("Booking rejected successfully");
    return res.status(200).json({ message: "Booking rejected.", booking });
  } catch (error) {
    logger.error("Failed to reject booking", error);
    return res.status(error.statusCode || 500).json({ message: error.message || "Error rejecting booking" });
  }
};

module.exports = { getPending, approveBooking, rejectBooking };
