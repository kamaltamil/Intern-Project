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
const { validateRequest } = require("../../../middleware/validationHandler");
const {
  createUserPayload,
  updateUserPayload,
} = require("../../../validators/userValidator");
const profileUpload = require("../../../middleware/profileUpload");

// Get all users visible to the authenticated user.
router.get("/", 
    /*
   #swagger.tags = ['UserManage']
  */
  requirePermission("users", "view"), listUsers);

// Get one user by ID.
router.get("/:id", 
    /*
   #swagger.tags = ['UserManage']
  */
  requirePermission("users", "view"), getUserById);

// Create a user after validating the request payload.
router.post("/", 
    /*
   #swagger.tags = ['UserManage']
  */
  requirePermission("users", "create"), createUserPayload, validateRequest, createUser);

// Update user details and optionally upload a profile image.
router.patch("/:id", 
    /*
   #swagger.tags = ['UserManage']
  */
  requirePermission("users", "update"), updateUserPayload, validateRequest, profileUpload.single("profileImage"), updateUser);

// Delete a user by ID.
router.delete("/:id", 
    /*
   #swagger.tags = ['UserManage']
  */
  requirePermission("users", "delete"), deleteUser);

module.exports = router;
