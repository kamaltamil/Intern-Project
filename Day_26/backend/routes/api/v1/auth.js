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
router.get(
  "/permissions",
  /*
    #swagger.tags = ['Authentication']
  */
  permissions
);

// Get current user's profile
router.get("/profile", 
    /*
      #swagger.tags = ['Authentication']
    */
    requirePermission("profile", "view"), profile);

// Update current user's profile
router.patch("/profile", 
    /*
      #swagger.tags = ['Authentication']
    */
    requirePermission("profile", "update"), profileUpload.single("profileImage"), updateProfile);

// Delete current user's profile
router.delete("/profile", 
    /*
      #swagger.tags = ['Authentication']
    */
    requirePermission("profile", "delete"), deleteProfile);

// Logout
router.post("/logout",
    /*
      #swagger.tags = ['Authentication']
    */
     logout);

module.exports = router;