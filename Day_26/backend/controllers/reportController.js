const { getReports } = require("../services/reportService");

const getReport = async (req, res) => {
  try {
    const report = await getReports();
    return res.status(200).json({ message: "Reports fetched successfully", report });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error fetching reports" });
  }
};

module.exports = { getReport };
