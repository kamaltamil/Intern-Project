const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const createAccessToken = (userId, role) => {
  return jwt.sign({ sub: userId, userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
};

const createRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

const ensureUniqueUsername = async (baseUsername) => {
  const username = String(baseUsername || "").toLowerCase().trim();
  const existing = await User.findOne({ username });

  if (!existing) {
    return username;
  }

  let suffix = 1;
  let candidate = `${username}${suffix}`;

  while (await User.findOne({ username: candidate })) {
    suffix += 1;
    candidate = `${username}${suffix}`;
  }

  return candidate;
};

const buildLoginQuery = ({ email, username }) => {
  const identifier = email || username;

  return {
    $or: [{ email: identifier }, { username: identifier }],
  };
};

const normalizeRegistrationInput = ({ name, email, password, username }) => {
  const normalizedName = name || username || "user";
  const normalizedUsername = username || normalizedName;
  const normalizedEmail = email || `${normalizedUsername}@local.dev`;

  return {
    name: normalizedName,
    email: normalizedEmail,
    username: normalizedUsername,
    password,
  };
};

const registerUser = async (input) => {
  const payload = normalizeRegistrationInput(input);
  const existingUser = await User.findOne({ $or: [{ email: payload.email }, { username: payload.username }] });

  if (existingUser) {
    throw new Error("User already exists");
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

  const token = createAccessToken(user._id, user.role);
  const refreshToken = createRefreshToken(user._id);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await User.findByIdAndUpdate(user._id, { refreshToken: hashedRefreshToken });

  return {
    user: await User.findById(user._id).select("-password"),
    token,
    refreshToken,
  };
};

const loginUser = async ({ email, password, username }) => {
  const query = buildLoginQuery({ email, username });
  const user = await User.findOne(query);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  const token = createAccessToken(user._id, user.role);
  const refreshToken = createRefreshToken(user._id);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await User.findByIdAndUpdate(user._id, { refreshToken: hashedRefreshToken });

  return {
    user: await User.findById(user._id).select("-password"),
    token,
    refreshToken,
  };
};


const getUserProfile = async (id) => {
  const user = await User.findById(id).select("-password");

  return user;
};

const getAllUsers = async () => {
  return User.find({}).select("-password").sort({ createdAt: -1 });
};

const updateUserRole = async (id, role) => {
  return User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
};

const refreshAccessToken = async ({ refreshToken }) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.userId);

  if (!user || !user.refreshToken) {
    throw new Error("Invalid refresh token");
  }

  const isValidRefreshToken = await bcrypt.compare(refreshToken, user.refreshToken);

  if (!isValidRefreshToken) {
    throw new Error("Invalid refresh token");
  }

  const accessToken = createAccessToken(user._id, user.role);

  return {
    token: accessToken,
    user: await User.findById(user._id).select("-password"),
  };
};

module.exports = {
  loginUser,
  registerUser,
  getUserProfile,
  getAllUsers,
  updateUserRole,
  refreshAccessToken,
  buildLoginQuery,
  normalizeRegistrationInput,
};