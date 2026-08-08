const jwt = require("jsonwebtoken");

const User = require("../models/user");

const accessSecret =
  process.env.JWT_ACCESS_SECRET || "dev-access-secret";

/* -------------------------------------------------------------------------- */
/*                         Authenticate JWT Token                             */
/* -------------------------------------------------------------------------- */

/**
 * Validates the Bearer token and attaches req.user with populated role.
 *
 * req.user shape:
 * {
 *   _id,
 *   name,
 *   email,
 *   username,
 *   role,          ← populated Role document object {_id, name, permissions}
 *   isActive,
 *   profileImage,
 * }
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, accessSecret);

    const user = await User.findById(decoded.userId)
      .populate("role")
      .select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "User account is inactive",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                     Check Module Permission (inline)                       */
/* -------------------------------------------------------------------------- */

const hasPermission = (resource, action) => {
  return (req, res, next) => {
    try {
      const permissions = req.user?.role?.permissions || [];

      const modulePermission = permissions.find(
        (permission) => permission.resource === resource
      );

      if (!modulePermission) {
        return res.status(403).json({
          message: "Permission denied",
        });
      }

      if (!modulePermission.action?.[action]) {
        return res.status(403).json({
          message: "Permission denied",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Permission validation failed",
      });
    }
  };
};

/* -------------------------------------------------------------------------- */
/*                         Require System Role                                */
/* -------------------------------------------------------------------------- */

const requireSystemRole = (...roles) => {
  return (req, res, next) => {
    const currentRole =
      typeof req.user?.role === "object"
        ? req.user?.role?.name
        : req.user?.role;

    if (!roles.includes(currentRole)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  hasPermission,
  requireSystemRole,
};