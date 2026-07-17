const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  register,
  login,
  getProfile,
  listUsers,
  changeUserRole,
  refresh,
} = require("../controllers/authController");
const { userManagementMiddleware } = require("../utils/rbac");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/profile", authMiddleware, getProfile);
router.get("/users", authMiddleware, userManagementMiddleware, listUsers);
router.put("/users/:id/role", authMiddleware, userManagementMiddleware, changeUserRole);

module.exports = router;