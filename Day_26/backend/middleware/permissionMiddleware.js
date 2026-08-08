const mongoose = require("mongoose");
const Role = require("../models/role");

/**
 * requirePermission(resource, action)
 *
 * Middleware factory that checks whether the authenticated user's role
 * has the given action permission for the given resource.
 *
 * Must run AFTER authenticateToken.
 *
 * Checks database-driven permissions in MongoDB.
 *
 * req.user.role can be:
 *   - Populated Role object: { _id, name: "Admin", permissions: [...] }
 *   - ObjectId / string ID
 *   - String role name
 */
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(401).json({
          message: "Unauthorized: user role not found",
        });
      }

      if (!resource || !action) {
        return res.status(500).json({
          message: "Permission configuration is invalid",
        });
      }

      /*
       * Resolve the Role document from MongoDB.
       */
      let role = null;

      if (typeof userRole === "object" && userRole.permissions) {
        role = userRole;
      } else if (mongoose.Types.ObjectId.isValid(userRole)) {
        role = await Role.findById(userRole).lean();
      } else if (typeof userRole === "string") {
        role = await Role.findOne({ name: userRole }).lean();
      }

      if (!role) {
        return res.status(403).json({
          message: "Forbidden: role not found in database",
        });
      }

      /*
       * Find the permission entry for the requested resource.
       */
      const permission = role.permissions?.find(
        (item) =>
          item.resource?.toLowerCase() === resource.toLowerCase()
      );

      if (!permission) {
        return res.status(403).json({
          message: `Forbidden: no permission configured for resource '${resource}'`,
        });
      }

      /*
       * Check the requested action.
       * Supports both `permission.action` and `permission.actions`.
       */
      const actionObj = permission.action || {};
      const allowed = actionObj[action] === true;

      if (!allowed) {
        return res.status(403).json({
          message: `Forbidden: '${action}' permission required for resource '${resource}'`,
        });
      }

      /*
       * Attach resolved permission context for controllers.
       */
      req.permission = {
        resource,
        action,
        allowed: true,
      };

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);

      return res.status(500).json({
        message: "Error checking permissions",
      });
    }
  };
};

module.exports = {
  requirePermission,
};