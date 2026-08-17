const jwt = require("jsonwebtoken");

const User = require("../models/user");

const accessSecret =
  process.env.JWT_ACCESS_SECRET || "dev-access-secret";

/* -------------------------------------------------------------------------- */
/*                         Authenticate JWT Token                             */
/* -------------------------------------------------------------------------- */

// Verifies the Bearer JWT token from the request header, loads the user from the database, and attaches it to req.user.
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if the authorization header exists and starts with Bearer.
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];

    // Decode and verify token signature.
    const decoded = jwt.verify(token, accessSecret);

    // Fetch user details along with populated role permissions.
    const user = await User.findById(decoded.userId)
      .populate("role")
      .select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Prevent inactive or suspended users from accessing APIs.
    if (!user.isActive) {
      return res.status(403).json({
        message: "User account is inactive",
      });
    }

    // Attach active user to request context.
    req.user = user;

    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                     Check Module Permission (inline)                       */
/* -------------------------------------------------------------------------- */

// Checks the authenticated user's populated role for the requested resource action.
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
      console.log(error)
      return res.status(500).json({
        message: "Permission validation failed",
      });
    }
  };
};

/* -------------------------------------------------------------------------- */
/*                         Require System Role                                */
/* -------------------------------------------------------------------------- */

// Restricts a route to one of the explicitly supplied system role names.
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