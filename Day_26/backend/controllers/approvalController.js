const {
  getPendingApprovals,
  changeApprovalStatus,
} = require("../services/approvalService");

const getPending = async (req, res) => {
  try {
    const bookings = await getPendingApprovals();
    return res.status(200).json({ message: "Pending bookings fetched successfully", bookings });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error fetching pending bookings" });
  }
};

const approveBooking = async (req, res) => {
  try {
    const booking = await changeApprovalStatus(req.params.id, "approve");
    return res.status(200).json({ message: "Booking approved. Payment is now pending.", booking });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error approving booking" });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const booking = await changeApprovalStatus(req.params.id, "reject");
    return res.status(200).json({ message: "Booking rejected.", booking });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error rejecting booking" });
  }
};

module.exports = { getPending, approveBooking, rejectBooking };
