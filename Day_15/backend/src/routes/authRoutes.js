const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  register,
  login,
  getProfile,
  listUsers,
  changeUserRole,
  deleteUser,
  refresh,
} = require("../controllers/authController");
const { userManagementMiddleware } = require("../utils/rbac");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

router.use(authMiddleware)

router.get("/profile", getProfile);

router.use(userManagementMiddleware)

router.get("/users", listUsers);
router.put("/users/:id", changeUserRole);
router.put("/users/:id/role", changeUserRole);
router.delete("/users/:id", deleteUser);

module.exports = router;