const {
  getPendingApprovals,
  changeApprovalStatus,
} = require("../services/approvalService");
const logger = require("../config/logger");
const {
  ok,
  notFound,
  internalServerError,
} = require("../utils/response");

// Return only pending bookings that belong to roles the current user can manage.
const getPending = async (req, res) => {
  try {
    const bookings = await getPendingApprovals(req.user?.role);
    logger.info("Pending booking approvals fetched successfully");
    return ok(res, "Pending bookings fetched successfully", { bookings });
  } catch (error) {
    logger.error("Failed to fetch pending booking approvals", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 404) return notFound(res, error.message || "Pending bookings not found");
    return internalServerError(res, error.message || "Error fetching pending bookings");
  }
};

// Approves a pending booking after checking the target user's manageable role.
const approveBooking = async (req, res) => {
  try {
    const booking = await changeApprovalStatus(req.params.id, "approve", req.user?.role);
    logger.info("Booking approved successfully");
    return ok(res, "Booking approved. Payment is now pending.", { booking });
  } catch (error) {
    logger.error("Failed to approve booking", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 404) return notFound(res, error.message || "Booking not found");
    return internalServerError(res, error.message || "Error approving booking");
  }
};

// Rejects a pending booking after checking the target user's manageable role.
const rejectBooking = async (req, res) => {
  try {
    const booking = await changeApprovalStatus(req.params.id, "reject", req.user?.role);
    logger.info("Booking rejected successfully");
    return ok(res, "Booking rejected.", { booking });
  } catch (error) {
    logger.error("Failed to reject booking", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 404) return notFound(res, error.message || "Booking not found");
    return internalServerError(res, error.message || "Error rejecting booking");
  }
};

module.exports = { getPending, approveBooking, rejectBooking };