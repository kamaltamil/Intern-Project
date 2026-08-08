const express = require("express");

const router = express.Router();

const {
  register,
  login,
  refresh,
  profile,
  logout,
} = require("../../../controllers/authController");

const { authenticateToken } = require("../../../middleware/auth");

/* -------------------------------------------------------------------------- */
/*                               Public Routes                                */
/* -------------------------------------------------------------------------- */

// Public signup (assigned default role from DB)
router.post("/signup", register);

// Login — returns token, refreshToken, role, permissions
router.post("/login", login);

// Refresh access token
router.post("/refresh", refresh);

/* -------------------------------------------------------------------------- */
/*                            Protected Routes                                */
/* -------------------------------------------------------------------------- */

// Current logged-in user's profile
router.get(
  "/profile",
  authenticateToken,
  profile
);

// Logout — clears stored refresh token
router.post(
  "/logout",
  authenticateToken,
  logout
);

module.exports = router;