const {
  getPendingApprovals,
  changeApprovalStatus,
} = require("../services/approvalService");

// Handles booking approval requests and delegates status changes to the service layer.
const getPending = async (req, res) => {
  try {
    const bookings = await getPendingApprovals();
    return res.status(200).json({ message: "Pending bookings fetched successfully", bookings });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error fetching pending bookings" });
  }
};

// Approves a pending booking so that payment can proceed.
const approveBooking = async (req, res) => {
  try {
    const booking = await changeApprovalStatus(req.params.id, "approve");
    return res.status(200).json({ message: "Booking approved. Payment is now pending.", booking });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error approving booking" });
  }
};

// Rejects a booking that is still waiting for approval.
const rejectBooking = async (req, res) => {
  try {
    const booking = await changeApprovalStatus(req.params.id, "reject");
    return res.status(200).json({ message: "Booking rejected.", booking });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error rejecting booking" });
  }
};

module.exports = { getPending, approveBooking, rejectBooking };
