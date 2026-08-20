const {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
  updateOwnProfile,
  deleteOwnProfile,
} = require("../services/authService");

const { verifyRecaptcha } = require("../services/recaptchaService");
const User = require("../models/user");
const Role = require("../models/role");
const logger = require("../config/logger");
const {
  ok,
  created,
  badRequest,
  unauthorized,
  notFound,
  internalServerError,
} = require("../utils/response");

// Verify the CAPTCHA token before continuing with the authentication operation.
const validateRecaptcha = async (req, token) => {
  if (!token) {
    const error = new Error("Please complete the reCAPTCHA verification");
    error.statusCode = 400;
    throw error;
  }

  const valid = await verifyRecaptcha(token, req.ip);
  if (!valid) {
    const error = new Error("reCAPTCHA verification failed. Please try again");
    error.statusCode = 400;
    throw error;
  }

  return valid;
};

// Registers a user using the role currently marked as the database default.
const register = async (req, res) => {
  try {
    logger.info("User registration requested");
    const { recaptchaToken, ...userData } = req.body;
    await validateRecaptcha(req, recaptchaToken);

    const defaultRole = await Role.findOne({ isDefault: true }).lean();
    if (!defaultRole) {
      const error = new Error("No default role found in system");
      error.statusCode = 400;
      throw error;
    }

    const user = await registerUser({ ...userData, role: defaultRole._id });
    logger.info("User registered successfully");
    return created(res, "User registered successfully", { user });
  } catch (error) {
    logger.error("User registration failed", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error registering user");
    return internalServerError(res, error.message || "Error registering user");
  }
};

// Validates login input and CAPTCHA before delegating credential verification to the service.
const login = async (req, res) => {
  try {
    logger.info("Login request received");
    const { identifier, password, recaptchaToken } = req.body;
    if (!identifier || !password) {
      return badRequest(res, "Identifier and password are required");
    }

    await validateRecaptcha(req, recaptchaToken);

    const result = await loginUser(identifier, password);
    logger.info("User logged in successfully");
    return ok(res, "Login successful", {
      user: result.user,
      token: result.token,
      refreshToken: result.refreshToken,
      role: result.role,
      roleDoc: result.roleDoc,
      dashboardConfig: result.dashboardConfig,
      permissions: result.permissions || [],
    });
  } catch (error) {
    logger.error("Login failed", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Login failed");
    if (statusCode === 401) return unauthorized(res, error.message || "Invalid credentials");
    return internalServerError(res, error.message || "Login failed");
  }
};

// Exchanges a valid refresh token for a new access/refresh token pair.
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return badRequest(res, "Refresh token is required");
    const result = await refreshAccessToken(refreshToken);
    logger.info("Access token refreshed successfully");
    return ok(res, "Access token refreshed successfully", {
      token: result.token,
      refreshToken: result.refreshToken,
      role: result.role,
      permissions: result.permissions || [],
    });
  } catch (error) {
    logger.error("Token refresh failed", error);
    const statusCode = error.statusCode || 401;
    if (statusCode === 400) return badRequest(res, error.message || "Refresh token is required");
    return unauthorized(res, error.message || "Invalid refresh token");
  }
};

// Returns the authenticated user's current profile and permissions.
const profile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return unauthorized(res, "Unauthorized");
    const result = await getProfile(userId);
    if (!result) return notFound(res, "User not found");
    return ok(res, "Profile fetched successfully", {
      user: result.user,
      role: result.role,
      roleDoc: result.roleDoc,
      dashboardConfig: result.dashboardConfig || result.roleDoc?.dashboardConfig,
      permissions: result.permissions || [],
    });
  } catch (error) {
    logger.error("Failed to fetch profile", error);
    return internalServerError(res, error.message || "Error fetching profile");
  }
};

// Returns only the role and permissions used by the frontend RBAC layer.
const permissions = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return unauthorized(res, "Unauthorized");

    const result = await getProfile(userId);
    if (!result) return notFound(res, "User not found");

    return ok(res, "Permissions fetched successfully", {
      role: result.role,
      roleColor: result.roleColor || result.user?.roleColor,
      roleDoc: result.roleDoc,
      dashboardConfig: result.dashboardConfig || result.roleDoc?.dashboardConfig,
      permissions: result.permissions || [],
      user: result.user,
    });
  } catch (error) {
    logger.error("Failed to fetch permissions", error);
    return internalServerError(res, error.message || "Error fetching permissions");
  }
};

// Updates only the authenticated user's own profile and optional profile image.
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return unauthorized(res, "Unauthorized");

    const updateData = { ...req.body };
    if (req.file) updateData.profileImage = `/uploads/profile/${req.file.filename}`;

    const result = await updateOwnProfile(userId, updateData);
    logger.info("User profile updated successfully");

    return ok(res, "Profile updated successfully", {
      user: result.user,
      role: result.role,
      permissions: result.permissions || [],
    });
  } catch (error) {
    logger.error("Failed to update user profile", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error updating profile");
    if (statusCode === 401) return unauthorized(res, error.message || "Unauthorized");
    return internalServerError(res, error.message || "Error updating profile");
  }
};

// Deletes the authenticated user's own profile after permission verification.
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return unauthorized(res, "Unauthorized");

    await deleteOwnProfile(userId);
    logger.info("User profile deleted successfully");
    return ok(res, "Profile deleted successfully");
  } catch (error) {
    logger.error("Failed to delete user profile", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error deleting profile");
    if (statusCode === 401) return unauthorized(res, error.message || "Unauthorized");
    return internalServerError(res, error.message || "Error deleting profile");
  }
};

// Invalidates the stored refresh token for the authenticated user.
const logout = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (userId) await User.findByIdAndUpdate(userId, { refreshToken: null });
    logger.info("User logged out successfully");
    return ok(res, "Logged out successfully");
  } catch (error) {
    logger.error("Logout failed", error);
    return internalServerError(res, error.message || "Error logging out");
  }
};

module.exports = { register, login, refresh, profile, permissions, updateProfile, deleteProfile, logout };