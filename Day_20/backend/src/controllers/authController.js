const {
  loginUser,
  registerUser,
  getUserProfile,
  getAllUsers,
  deleteUserProfile,
  changeUserDetails,
  refreshAccessToken,
  uploadProfileImage,
} = require("../services/authService");

const { successResponse, errorResponse } = require("../utils/response");

const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    return successResponse(res, result, "Registration successful", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    return successResponse(res, result, "Login successful");
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await getUserProfile(req.user._id);

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, user);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    return successResponse(res, users);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    // Bug fix: was req.params._id — route defines :id, so the param was always undefined.
    const deletedUser = await deleteUserProfile(req.params.id);

    if (!deletedUser) return errorResponse(res, "User not found", 404);

    const users = await getAllUsers();
    return successResponse(res, users, "User deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const changeUserData = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updates = {};

    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    if (typeof email === "string" && email.trim()) updates.email = email.trim().toLowerCase();
    if (role) updates.role = role;

    if (Object.keys(updates).length === 0) {
      return errorResponse(res, "Provide at least one field to update", 400);
    }

    const user = await changeUserDetails(req.params.id, updates);

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, user, "User data updated successfully");
  } catch (error) {
    const status = error.name === "ValidationError" ? 400 : 500;
    return errorResponse(res, error.message, status);
  }
};

const refresh = async (req, res) => {
  try {
    const result = await refreshAccessToken(req.body);
    return successResponse(res, result, "Token refreshed successfully");
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, "No image file provided", 400);
    }

    const user = await uploadProfileImage(req.user._id, req.file.filename);

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, user, "Profile image uploaded successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { register, login, getProfile, listUsers, changeUserData, refresh, deleteUser, uploadImage };