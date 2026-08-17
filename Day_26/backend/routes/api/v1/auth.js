const express = require("express");

const router = express.Router();

const {
  profile,
  permissions,
  updateProfile,
  deleteProfile,
  logout,
} = require("../../../controllers/authController");

const { requirePermission } = require("../../../middleware/permissionMiddleware");
const profileUpload = require("../../../middleware/profileUpload");

// Get current user's permissions
router.get("/permissions",  permissions);

// Get current user's profile
router.get("/profile",  requirePermission("profile", "view"),  profile
);

// Update current user's profile
router.patch("/profile",  requirePermission("profile", "update"),  profileUpload.single("profileImage"),
  updateProfile
);

// Delete current user's profile
router.delete("/profile",  requirePermission("profile", "delete"),  deleteProfile
);

// Logout
router.post("/logout",  logout);

module.exports = router;