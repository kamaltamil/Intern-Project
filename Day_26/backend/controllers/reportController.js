const { getReports } = require("../services/reportService");
const { ok, internalServerError } = require("../utils/response");

// Aggregates report data within the current user's manageable-role scope.
const getReport = async (req, res) => {
  try {
    const report = await getReports(req.user?.role);
    return ok(res, "Reports fetched successfully", { report });
  } catch (error) {
    return internalServerError(res, error.message || "Error fetching reports");
  }
};

module.exports = { getReport };