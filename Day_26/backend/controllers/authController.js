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
    return res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    logger.error("User registration failed", error);
    return res.status(error.statusCode || 500).json({ message: error.message || "Error registering user" });
  }
};

// Validates login input and CAPTCHA before delegating credential verification to the service.
const login = async (req, res) => {
  try {
    logger.info("Login request received");
    const { identifier, password, recaptchaToken } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier and password are required" });
    }

    await validateRecaptcha(req, recaptchaToken);

    const result = await loginUser(identifier, password);
    logger.info("User logged in successfully");
    return res.status(200).json({
      message: "Login successful",
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
    return res.status(error.statusCode || 500).json({ message: error.message || "Login failed" });
  }
};

// Exchanges a valid refresh token for a new access/refresh token pair.
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token is required" });
    const result = await refreshAccessToken(refreshToken);
    logger.info("Access token refreshed successfully");
    return res.status(200).json({
      message: "Access token refreshed successfully",
      token: result.token,
      refreshToken: result.refreshToken,
      role: result.role,
      permissions: result.permissions || [],
    });
  } catch (error) {
    logger.error("Token refresh failed", error);
    return res.status(error.statusCode || 401).json({ message: error.message || "Invalid refresh token" });
  }
};

// Returns the authenticated user's current profile and permissions.
const profile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const result = await getProfile(userId);
    if (!result) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({
      user: result.user,
      role: result.role,
      roleDoc: result.roleDoc,
      dashboardConfig: result.dashboardConfig || result.roleDoc?.dashboardConfig,
      permissions: result.permissions || [],
    });
  } catch (error) {
    logger.error("Failed to fetch profile", error);
    return res.status(500).json({ message: error.message || "Error fetching profile" });
  }
};

// Returns only the role and permissions used by the frontend RBAC layer.
const permissions = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await getProfile(userId);
    if (!result) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      role: result.role,
      roleColor: result.roleColor || result.user?.roleColor,
      roleDoc: result.roleDoc,
      dashboardConfig: result.dashboardConfig || result.roleDoc?.dashboardConfig,
      permissions: result.permissions || [],
      user: result.user,
    });
  } catch (error) {
    logger.error("Failed to fetch permissions", error);
    return res.status(500).json({ message: error.message || "Error fetching permissions" });
  }
};

// Updates only the authenticated user's own profile and optional profile image.
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updateData = { ...req.body };
    if (req.file) updateData.profileImage = `/uploads/profile/${req.file.filename}`;

    const result = await updateOwnProfile(userId, updateData);
    logger.info("User profile updated successfully");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: result.user,
      role: result.role,
      permissions: result.permissions || [],
    });
  } catch (error) {
    logger.error("Failed to update user profile", error);
    return res.status(error.statusCode || 500).json({ message: error.message || "Error updating profile" });
  }
};

// Deletes the authenticated user's own profile after permission verification.
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await deleteOwnProfile(userId);
    logger.info("User profile deleted successfully");
    return res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    logger.error("Failed to delete user profile", error);
    return res.status(error.statusCode || 500).json({ message: error.message || "Error deleting profile" });
  }
};

// Invalidates the stored refresh token for the authenticated user.
const logout = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (userId) await User.findByIdAndUpdate(userId, { refreshToken: null });
    logger.info("User logged out successfully");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout failed", error);
    return res.status(500).json({ message: error.message || "Error logging out" });
  }
};

module.exports = { register, login, refresh, profile, permissions, updateProfile, deleteProfile, logout };