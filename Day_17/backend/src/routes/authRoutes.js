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

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

router.use(authMiddleware)

router.get("/profile", getProfile);

router.use(userManagementMiddleware)

router.get("/users", listUsers);
router.patch("/users/:id", changeUserData);
router.delete("/users/:id", deleteUser);

module.exports = router;