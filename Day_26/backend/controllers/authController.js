const {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
  updateOwnProfile,
} = require("../services/authService");

const { verifyRecaptcha } = require("../services/recaptchaService");
const User = require("../models/user");

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

// Registers a user only after the submitted reCAPTCHA token has been verified.
const register = async (req, res) => {
  try {
    const { recaptchaToken, ...userData } = req.body;
    await validateRecaptcha(req, recaptchaToken);

    const user = await registerUser(userData);
    return res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error registering user" });
  }
};

// Validates login input and CAPTCHA before delegating credential verification to the service.
const login = async (req, res) => {
  try {
    const { identifier, password, recaptchaToken } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier and password are required" });
    }

    await validateRecaptcha(req, recaptchaToken);

    const result = await loginUser(identifier, password);
    return res.status(200).json({
      message: "Login successful",
      user: result.user,
      token: result.token,
      refreshToken: result.refreshToken,
      role: result.role,
      permissions: result.permissions || [],
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Login failed" });
  }
};

// Exchanges a valid refresh token for a new access/refresh token pair.
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token is required" });
    const result = await refreshAccessToken(refreshToken);
    return res.status(200).json({
      message: "Access token refreshed successfully",
      token: result.token,
      refreshToken: result.refreshToken,
      role: result.role,
      permissions: result.permissions || [],
    });
  } catch (error) {
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
    return res.status(200).json({ user: result.user, role: result.role, permissions: result.permissions || [] });
  } catch (error) {
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
      permissions: result.permissions || [],
    });
  } catch (error) {
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

    return res.status(200).json({
      message: "Profile updated successfully",
      user: result.user,
      role: result.role,
      permissions: result.permissions || [],
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error updating profile" });
  }
};

// Invalidates the stored refresh token for the authenticated user.
const logout = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (userId) await User.findByIdAndUpdate(userId, { refreshToken: null });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error logging out" });
  }
};

module.exports = { register, login, refresh, profile, permissions, updateProfile, logout };
