const express = require("express");

const router = express.Router();

const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../../../controllers/userController");

const {
  requirePermission,
} = require("../../../middleware/permissionMiddleware");

const profileUpload = require("../../../middleware/profileUpload");


/* GET ALL USERS  */
router.get("/", requirePermission("users", "view"), listUsers);

/* GET USER BY ID  */
router.get("/:id", requirePermission("users", "view"), getUserById);

/* CREATE USER */
router.post("/", requirePermission("users", "create"), createUser);

/* UPDATE USER */
router.patch("/:id", requirePermission("users", "update"), profileUpload.single("profileImage"), updateUser);

/* DELETE USER */
router.delete("/:id", requirePermission("users", "delete"), deleteUser);

module.exports = router;