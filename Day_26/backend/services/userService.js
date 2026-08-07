const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/users");


const ensureUniqueUsername = async (baseUsername) => {
  const username = String(baseUsername || "").toLowerCase().trim();
  const existing = await User.findOne({ username });

  if (!existing) return username;

  let suffix = 1;
  let candidate = `${username}${suffix}`;

  while (await User.findOne({ username: candidate })) {
    suffix += 1;
    candidate = `${username}${suffix}`;
  }

  return candidate;
};

const accessSecret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

const createAccessToken = (userId, role) =>
  jwt.sign({ sub: userId, userId, role }, accessSecret, { expiresIn: "1h" });

const createRefreshToken = (userId) =>
  jwt.sign(
    { userId, jti: crypto.randomUUID() },
    refreshSecret,
    { expiresIn: "7d" }
  );

const generateAndStoreTokens = async (user) => {
  const token = createAccessToken(user._id, user.role);
  const refreshToken = createRefreshToken(user._id);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await User.findByIdAndUpdate(user._id, { refreshToken: hashedRefreshToken });

  return { token, refreshToken };
};

const buildLoginQuery = ({ email, username, identifier }) => {
  const lookupValue = identifier || email || username;

  if (!lookupValue) {
    return {};
  }

  return {
    $or: [{ email: lookupValue }, { username: lookupValue }],
  };
};

const loginUser = async ({ identifier, password }) => {
  const user = await User.findOne(buildLoginQuery({ identifier }));

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const { token, refreshToken } = await generateAndStoreTokens(user);

  return {
    user: await User.findById(user._id).select('-password -refreshToken'),
    token,
    refreshToken,
  };
};

const logoutUser = async (id) => {
  return await User.findByIdAndUpdate(
    id,
    { refreshToken: null },
    { new: true }
  );
};

const normalizeRegistrationInput = ({ name, email, password, username }) => {
  const normalizedName = String(name || username || "user").trim();
  const normalizedUsername = String(username || normalizedName).trim().toLowerCase();
  const normalizedEmail = String(email || `${normalizedUsername}@local.dev`).trim().toLowerCase();

  return {
    name: normalizedName,
    email: normalizedEmail,
    username: normalizedUsername,
    password,
  };
};

const normalizeUpdateInput = async ({ name, email, username, password, role, profileImage }) => {
  const update = {};

  if (name) update.name = String(name).trim();
  if (email) update.email = String(email).trim().toLowerCase();
  if (username) update.username = String(username).trim().toLowerCase();
  if (role) update.role = role;

  if (password) update.password = await bcrypt.hash(password, 10);

  if (profileImage) update.profileImage = String(profileImage).trim();

  return update;
};

const getAllUsers = async () => {
  return await User.find().select("-password -refreshToken");
};

const getAllMembers = async () => {
  return await User.find({ role: "Member" }).select("-password -refreshToken");
}

const getUserById = async (id) => {
  return await User.findById(id).select("-password -refreshToken");
};

const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

const updateUser = async (id, input) => {
  const update = await normalizeUpdateInput(input);

  if (update.username) {
    update.username = await ensureUniqueUsername(update.username);
  }

  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).select("-password -refreshToken").lean();

  return user;
};

const registerUser = async (input) => {
  const payload = normalizeRegistrationInput(input);
  const existingUser = await User.findOne({
    $or: [{ email: payload.email }, { username: payload.username }],
  });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const username = await ensureUniqueUsername(payload.username);

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    username,
    password: hashedPassword,
    role: "Member",
  });

  const { token, refreshToken } = await generateAndStoreTokens(user);

  return {
    user: await User.findById(user._id).select("-password -refreshToken -refreshToken"),
    token,
    refreshToken,
  };
};

const refreshAccessToken = async (refreshToken) => {
    let payload;

    try {
        payload = jwt.verify(refreshToken, refreshSecret);
    } catch (error) {
        error.statusCode = 401;
        throw error;
    }

    const user = await User.findById(payload.userId);

    if (!user?.refreshToken) {
        const error = new Error('Unauthorized');
        error.statusCode = 401;
        throw error;
    }

    const valid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!valid) {
        const error = new Error('Invalid refresh token');
        error.statusCode = 401;
        throw error;
    }

    return await generateAndStoreTokens(user);
};

module.exports = {
  registerUser,
  getAllUsers,
  getAllMembers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
  buildLoginQuery,
  refreshAccessToken,
};