const {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
  updateOwnProfile,
} = require("../services/authService");

const User = require("../models/user");

const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    return res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error registering user" });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier and password are required" });
    }
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