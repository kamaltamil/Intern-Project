const express = require("express");
const router = express.Router();

const { getReport } = require("../../../controllers/reportController");
const { requirePermission } = require("../../../middleware/permissionMiddleware");

router.get("/", requirePermission("reports", "view"), getReport);

module.exports = router;
