const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/profileUpload");
const {
  register,
  login,
  getProfile,
  listUsers,
  changeUserData,
  deleteUser,
  refresh,
  uploadImage,
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

// Protected routes — any authenticated user
router.use(authMiddleware);
router.get("/profile", authenticatedLimiter, getProfile);
router.post("/profile/image", upload.single("profileImage"), uploadImage);

// Admin-only routes — userManagementMiddleware applied per-route to avoid leaking into /profile/image
router.get("/users", authenticatedLimiter, userManagementMiddleware, listUsers);
router.patch("/users/:id", authenticatedLimiter, userManagementMiddleware, validateUserId, validateUpdateUser, handleValidationErrors, changeUserData);
router.delete("/users/:id", authenticatedLimiter, userManagementMiddleware, validateUserId, handleValidationErrors, deleteUser);

module.exports = router;