const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  register,
  login,
  getProfile,
  listUsers,
  changeUserData,
  deleteUser,
  refresh,
} = require("../controllers/authController");
const { userManagementMiddleware } = require("../utils/rbac");

const {
  validateRegister,
  validateLogin,
  validateRefresh,
  validateUpdateUser,
  validateUserId,
} = require("../middleware/validators/authValidator");
const handleValidationErrors = require("../middleware/validators/validationHandler");

const {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  authenticatedLimiter,
} = require("../config/rateLimitConfig");

// Public routes
router.post("/register", registerLimiter, validateRegister, handleValidationErrors, register);
router.post("/login", loginLimiter, validateLogin, handleValidationErrors, login);
router.post("/refresh", refreshLimiter, validateRefresh, handleValidationErrors, refresh);

// Protected routes (require auth token)
router.use(authMiddleware);
router.get("/profile", authenticatedLimiter, getProfile);

// Admin-only routes
router.use(userManagementMiddleware);
router.get("/users", authenticatedLimiter, listUsers);
router.patch("/users/:id", authenticatedLimiter, validateUserId, validateUpdateUser, handleValidationErrors, changeUserData);
router.delete("/users/:id", authenticatedLimiter, validateUserId, handleValidationErrors, deleteUser);

module.exports = router;