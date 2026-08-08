const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mongoose = require("mongoose");

const User = require("../models/user");
const Role = require("../models/role");

const accessSecret =
  process.env.JWT_ACCESS_SECRET || "dev-access-secret";

const refreshSecret =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

/**
 * Normalize permissions array so both action and actions fields exist.
 */
const normalizePermissions = (permissions = []) => {
  if (!Array.isArray(permissions)) {
    return [];
  }

  return permissions.map((permission) => {
    const act = permission.action || permission.actions || {};

    return {
      resource: permission.resource,
      action: {
        view: act.view === true,
        create: act.create === true,
        update: act.update === true,
        delete: act.delete === true,
      },
    };
  });
};

/**
 * Create access token
 */
const createAccessToken = (userId, roleName) => {
  return jwt.sign(
    {
      sub: userId.toString(),
      userId: userId.toString(),
      role: roleName,
    },
    accessSecret,
    {
      expiresIn: "1h",
    }
  );
};

/**
 * Create refresh token
 */
const createRefreshToken = (userId) => {
  return jwt.sign(
    {
      userId: userId.toString(),
      jti: crypto.randomUUID(),
    },
    refreshSecret,
    {
      expiresIn: "7d",
    }
  );
};

/**
 * Find role by ID or Name
 */
const getRoleDocument = async (roleRef) => {
  if (!roleRef) return null;

  if (typeof roleRef === "object" && roleRef.name) {
    return roleRef;
  }

  if (mongoose.Types.ObjectId.isValid(roleRef)) {
    const roleDoc = await Role.findById(roleRef).lean();
    if (roleDoc) return roleDoc;
  }

  return await Role.findOne({ name: roleRef }).lean();
};

/**
 * Get permissions for a role reference (ID or Name)
 */
const getRolePermissions = async (roleRef) => {
  const roleDoc = await getRoleDocument(roleRef);
  if (!roleDoc) return [];
  return normalizePermissions(roleDoc.permissions);
};

/**
 * Generate and store JWT tokens
 */
const generateAndStoreTokens = async (userId, roleName) => {
  const token = createAccessToken(userId, roleName);
  const refreshToken = createRefreshToken(userId);

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await User.findByIdAndUpdate(userId, {
    refreshToken: hashedRefreshToken,
  });

  return {
    token,
    refreshToken,
  };
};

/**
 * Register user (public signup)
 */
const registerUser = async ({
  name,
  email,
  username,
  password,
  role,
}) => {
  if (!name || !email || !username || !password) {
    const error = new Error("Name, email, username and password are required");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({
    $or: [
      { email: email.toLowerCase().trim() },
      { username: username.trim().toLowerCase() },
    ],
  });

  if (existingUser) {
    const error = new Error("Email or username already exists");
    error.statusCode = 409;
    throw error;
  }

  let roleDoc = null;

  if (role) {
    roleDoc = await getRoleDocument(role);
  }

  if (!roleDoc) {
    roleDoc = await Role.findOne({ isDefault: true }).lean();
  }

  if (!roleDoc) {
    roleDoc = await Role.findOne({ name: "Member" }).lean();
  }

  if (!roleDoc) {
    const error = new Error("No default role found in system");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    username: username.trim().toLowerCase(),
    password: hashedPassword,
    role: roleDoc._id,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: roleDoc.name,
  };
};

/**
 * Login user
 */
const loginUser = async (identifier, password) => {
  if (!identifier || !password) {
    const error = new Error("Email/username and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedIdentifier = identifier.trim();

  const user = await User.findOne({
    $or: [
      { email: normalizedIdentifier.toLowerCase() },
      { username: normalizedIdentifier },
    ],
  }).populate("role");

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  let roleDoc = user.role;

  if (!roleDoc || !roleDoc.name) {
    roleDoc = await getRoleDocument(user.role);
  }

  const roleName = roleDoc?.name || "Member";
  const permissions = normalizePermissions(roleDoc?.permissions || []);

  const tokens = await generateAndStoreTokens(user._id, roleName);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: roleName,
      profileImage: user.profileImage,
    },
    token: tokens.token,
    refreshToken: tokens.refreshToken,
    role: roleName,
    permissions,
  };
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, refreshSecret);
  } catch (error) {
    const authError = new Error("Invalid or expired refresh token");
    authError.statusCode = 401;
    throw authError;
  }

  const userId = decoded.userId || decoded.sub;
  if (!userId) {
    const error = new Error("Invalid refresh token payload");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(userId).populate("role");

  if (!user || !user.refreshToken) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const refreshTokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);

  if (!refreshTokenMatch) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  let roleDoc = user.role;
  if (!roleDoc || !roleDoc.name) {
    roleDoc = await getRoleDocument(user.role);
  }

  const roleName = roleDoc?.name || "Member";
  const permissions = normalizePermissions(roleDoc?.permissions || []);

  const newToken = createAccessToken(user._id, roleName);
  const newRefreshToken = createRefreshToken(user._id);

  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

  await User.findByIdAndUpdate(user._id, {
    refreshToken: hashedRefreshToken,
  });

  return {
    token: newToken,
    refreshToken: newRefreshToken,
    role: roleName,
    permissions,
  };
};

/**
 * Get logged-in user's profile
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId).populate("role").lean();

  if (!user) {
    return null;
  }

  let roleDoc = user.role;
  if (!roleDoc || !roleDoc.name) {
    roleDoc = await getRoleDocument(user.role);
  }

  const roleName = roleDoc?.name || "Member";
  const permissions = normalizePermissions(roleDoc?.permissions || []);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: roleName,
      profileImage: user.profileImage,
    },
    role: roleName,
    permissions,
  };
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
  createAccessToken,
  createRefreshToken,
  generateAndStoreTokens,
  getRolePermissions,
  getRoleDocument,
};