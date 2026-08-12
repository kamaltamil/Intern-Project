const express = require("express");

const router = express.Router();

const {
  register,
  login,
  refresh,
  profile,
  updateProfile,
  logout,
} = require("../../../controllers/authController");

const { authenticateToken } = require("../../../middleware/auth");
const { requirePermission } = require("../../../middleware/permissionMiddleware");
const profileUpload = require("../../../middleware/profileUpload");

router.post("/signup", register);
router.post("/login", login);
router.post("/refresh", refresh);

router.get(
  "/profile",
  authenticateToken,
  requirePermission("profile", "view"),
  profile
);

router.patch(
  "/profile",
  authenticateToken,
  requirePermission("profile", "update"),
  profileUpload.single("profileImage"),
  updateProfile
);

router.post("/logout", authenticateToken, logout);

module.exports = router;