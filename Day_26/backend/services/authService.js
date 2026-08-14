const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const mongoose = require("mongoose");

const User = require("../models/user");
const Role = require("../models/role");

const accessSecret = process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const nameRegex = /^[a-zA-Z]{2,}(?:\s[a-zA-Z]{2,})+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const userNameRegex = /^[a-zA-Z\d_]{3,16}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@&%*+!$])[a-zA-Z\d@&%*+!$]{8,}$/;

const normalizePermissions = (permissions = []) => {
  if (!Array.isArray(permissions)) return [];
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

const createAccessToken = (userId, roleName) =>
  jwt.sign(
    { sub: userId.toString(), userId: userId.toString(), role: roleName },
    accessSecret,
    { expiresIn: "1h" },
  );

const createRefreshToken = (userId) =>
  jwt.sign(
    { userId: userId.toString(), jti: crypto.randomUUID() },
    refreshSecret,
    { expiresIn: "7d" },
  );

const getRoleDocument = async (roleRef) => {
  if (!roleRef) return null;
  if (typeof roleRef === "object" && roleRef.name) return roleRef;
  if (mongoose.Types.ObjectId.isValid(roleRef)) {
    const roleDoc = await Role.findById(roleRef).lean();
    if (roleDoc) return roleDoc;
  }
  return await Role.findOne({ name: roleRef }).lean();
};

const getRolePermissions = async (roleRef) => {
  const roleDoc = await getRoleDocument(roleRef);
  if (!roleDoc) return [];
  return normalizePermissions(roleDoc.permissions);
};

const generateAndStoreTokens = async (userId, roleName) => {
  const token = createAccessToken(userId, roleName);
  const refreshToken = createRefreshToken(userId);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  await User.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken });
  return { token, refreshToken };
};

const registerUser = async ({ name, email, username, password, role }) => {
  if (!name || !email || !username || !password) {
    const error = new Error("Name, email, username and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedName = String(name).trim();
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedUsername = String(username).trim().toLowerCase();

  if (!nameRegex.test(normalizedName)) {
    const error = new Error(
      "Name must contain at least two words with at least 2 letters each",
    );
    error.statusCode = 400;
    throw error;
  }
  if (!emailRegex.test(normalizedEmail)) {
    const error = new Error("Please enter a valid email address");
    error.statusCode = 400;
    throw error;
  }
  if (!userNameRegex.test(normalizedUsername)) {
    const error = new Error(
      "Username must be 3-16 characters and contain only letters, numbers, or underscores",
    );
    error.statusCode = 400;
    throw error;
  }
  if (!passwordRegex.test(String(password))) {
    const error = new Error(
      "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
    );
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });
  if (existingUser) {
    const error = new Error("Email or username already exists");
    error.statusCode = 409;
    throw error;
  }

  let roleDoc = null;
  if (role) roleDoc = await getRoleDocument(role);
  if (!roleDoc) roleDoc = await Role.findOne({ isDefault: true }).lean();
  if (!roleDoc) roleDoc = await Role.findOne({ name: "Member" }).lean();
  if (!roleDoc) {
    const error = new Error("No default role found in system");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    username: normalizedUsername,
    password: hashedPassword,
    role: roleDoc._id,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: roleDoc.name,
    roleColor: roleDoc.color || "#722ed1",
  };
};

const loginUser = async (identifier, password) => {
  if (!identifier || !password) {
    const error = new Error("Email/username and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedIdentifier = String(identifier).trim();
  if (!normalizedIdentifier) {
    const error = new Error("Email/username and password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({
    $or: [
      { email: normalizedIdentifier.toLowerCase() },
      { username: normalizedIdentifier.toLowerCase() },
    ],
  }).populate("role");

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(String(password), user.password);
  if (!passwordMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const roleDoc = user.role?.name
    ? user.role
    : await getRoleDocument(user.role);
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
      roleColor: roleDoc?.color || "#722ed1",
      profileImage: user.profileImage,
    },
    token: tokens.token,
    refreshToken: tokens.refreshToken,
    role: roleName,
    permissions,
  };
};

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
  if (!user?.refreshToken) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const refreshTokenMatch = await bcrypt.compare(
    refreshToken,
    user.refreshToken,
  );
  if (!refreshTokenMatch) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const roleDoc = user.role?.name
    ? user.role
    : await getRoleDocument(user.role);
  const roleName = roleDoc?.name || "Member";
  const permissions = normalizePermissions(roleDoc?.permissions || []);
  const newToken = createAccessToken(user._id, roleName);
  const newRefreshToken = createRefreshToken(user._id);
  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
  await User.findByIdAndUpdate(user._id, { refreshToken: hashedRefreshToken });

  return {
    token: newToken,
    refreshToken: newRefreshToken,
    role: roleName,
    permissions,
  };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).populate("role").lean();
  if (!user) return null;

  const roleDoc = user.role?.name
    ? user.role
    : await getRoleDocument(user.role);
  const roleName = roleDoc?.name || "Member";
  const permissions = normalizePermissions(roleDoc?.permissions || []);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: roleName,
      roleColor: roleDoc?.color || "#722ed1",
      profileImage: user.profileImage,
    },
    role: roleName,
    permissions,
  };
};

const throwValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

const validateProfileName = (value) => {
  const name = String(value).trim();
  if (!name) throwValidationError("Name is required");
  if (!nameRegex.test(name)) {
    throwValidationError(
      "Name must contain at least two words with at least 2 letters each",
    );
  }
  return name;
};

const validateProfileEmail = async (value, userId) => {
  const email = String(value).trim().toLowerCase();
  if (!email) throwValidationError("Email is required");
  if (!emailRegex.test(email)) throwValidationError("Please enter a valid email address");
  const existing = await User.findOne({ email, _id: { $ne: userId } });
  if (existing) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }
  return email;
};

const validateProfileUsername = async (value, userId) => {
  const username = String(value).trim().toLowerCase();
  if (!username) throwValidationError("Username is required");
  if (!userNameRegex.test(username)) {
    throwValidationError(
      "Username must be 3-16 characters and contain only letters, numbers, or underscores",
    );
  }
  const existing = await User.findOne({ username, _id: { $ne: userId } });
  if (existing) {
    const error = new Error("Username already exists");
    error.statusCode = 409;
    throw error;
  }
  return username;
};

const validateAndHashProfilePassword = async (value) => {
  const password = String(value);
  if (!password.trim()) throwValidationError("Password cannot be empty");
  if (!passwordRegex.test(password)) {
    throwValidationError(
      "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
    );
  }
  return await bcrypt.hash(password, 10);
};

const updateOwnProfile = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (payload.name !== undefined) user.name = validateProfileName(payload.name);
  if (payload.email !== undefined)
    user.email = await validateProfileEmail(payload.email, userId);
  if (payload.username !== undefined)
    user.username = await validateProfileUsername(payload.username, userId);
  if (payload.password !== undefined)
    user.password = await validateAndHashProfilePassword(payload.password);
  if (payload.profileImage !== undefined)
    user.profileImage = payload.profileImage;

  await user.save();
  return await getProfile(user._id);
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
  updateOwnProfile,
  createAccessToken,
  createRefreshToken,
  generateAndStoreTokens,
  getRolePermissions,
  getRoleDocument,
};
