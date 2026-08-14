const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const User = require("../models/user");
const Role = require("../models/role");

const nameRegex = /^[a-zA-Z]{2,}(?:\s[a-zA-Z]{2,})+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const userNameRegex = /^[a-zA-Z\d_]{3,16}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@&%*+!$])[a-zA-Z\d@&%*+!$]{8,}$/;

const resolveRole = async (userRoleRef) => {
  if (!userRoleRef) return null;
  if (typeof userRoleRef === "object" && userRoleRef.permissions && userRoleRef._id) return userRoleRef;
  if (mongoose.Types.ObjectId.isValid(userRoleRef)) return await Role.findById(userRoleRef).lean();
  if (typeof userRoleRef === "string") return await Role.findOne({ name: userRoleRef }).lean();
  return null;
};

const getAllUsers = async (requestingUser = null) => {
  if (!requestingUser) return await User.find().populate("role").select("-password -refreshToken").sort({ createdAt: -1 });
  const roleDoc = await resolveRole(requestingUser.role);
  if (roleDoc?.name === "Admin") return await User.find().populate("role").select("-password -refreshToken").sort({ createdAt: -1 });
  const manageableRoles = roleDoc?.manageableRoles || [];
  if (!Array.isArray(manageableRoles) || manageableRoles.length === 0) return [];
  const roleIds = manageableRoles.map((r) => typeof r === "object" ? r._id || r : r);
  return await User.find({ role: { $in: roleIds } }).populate("role").select("-password -refreshToken").sort({ createdAt: -1 });
};

const getUserById = async (id) => await User.findById(id).populate("role").select("-password -refreshToken");

const throwBadRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

const throwConflict = (message) => {
  const error = new Error(message);
  error.statusCode = 409;
  throw error;
};

const throwForbidden = (message) => {
  const error = new Error(message);
  error.statusCode = 403;
  throw error;
};

const validateCreateUserInput = ({ name, email, username, password, role }) => {
  if (!name || !email || !username || !password || !role) throwBadRequest("Name, email, username, password and role are required");
  const normalizedName = String(name).trim();
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedUsername = String(username).trim().toLowerCase();
  if (!nameRegex.test(normalizedName)) throwBadRequest("Name must contain at least two words with at least 2 letters each");
  if (!emailRegex.test(normalizedEmail)) throwBadRequest("Please enter a valid email address");
  if (!userNameRegex.test(normalizedUsername)) throwBadRequest("Username must be 3-16 characters and contain only letters, numbers, or underscores");
  if (!passwordRegex.test(String(password))) throwBadRequest("Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character");
  return { normalizedName, normalizedEmail, normalizedUsername };
};

const findRoleByReference = async (role) => {
  let roleDocument = null;
  if (mongoose.Types.ObjectId.isValid(role)) roleDocument = await Role.findById(role).lean();
  if (!roleDocument) roleDocument = await Role.findOne({ name: role }).lean();
  if (!roleDocument) throwBadRequest(`Role "${role}" does not exist`);
  return roleDocument;
};

const validateCreateRolePermission = async (requestingUser, roleDocument) => {
  if (!requestingUser) return;
  const reqRole = await resolveRole(requestingUser.role);
  if (reqRole?.name === "Admin") return;
  const allowedRoles = reqRole?.manageableRoles || [];
  const isAllowed = allowedRoles.some((rId) => rId.toString() === roleDocument._id.toString());
  if (!isAllowed) throwForbidden("Forbidden: You are not authorized to create a user with this role");
};

const createUser = async ({ name, email, username, password, role, createdBy = null, requestingUser = null }) => {
  const normalized = validateCreateUserInput({ name, email, username, password, role });
  const roleDocument = await findRoleByReference(role);
  await validateCreateRolePermission(requestingUser, roleDocument);
  const existing = await User.findOne({ $or: [{ email: normalized.normalizedEmail }, { username: normalized.normalizedUsername }] });
  if (existing) throwConflict("Email or username already exists");
  const hashedPassword = await bcrypt.hash(String(password), 10);
  const user = await User.create({ name: normalized.normalizedName, email: normalized.normalizedEmail, username: normalized.normalizedUsername, password: hashedPassword, role: roleDocument._id, createdBy });
  return await User.findById(user._id).populate("role").select("-password -refreshToken");
};

const findRoleForManageableAssignment = async (role) => {
  let roleDocument = null;
  if (mongoose.Types.ObjectId.isValid(role)) roleDocument = await Role.findById(role).lean();
  if (!roleDocument) roleDocument = await Role.findOne({ name: role }).lean();
  return roleDocument;
};

const validateManageableRole = async (user, payload, requestingUser) => {
  if (!requestingUser) return;
  const reqRole = await resolveRole(requestingUser.role);
  if (reqRole?.name === "Admin") return;
  const allowedRoles = new Set((reqRole?.manageableRoles || []).map((r) => r.toString()));
  const currentRoleStr = user.role?.toString();
  if (!allowedRoles.has(currentRoleStr)) throwForbidden("Forbidden: You are not authorized to manage this user");
  if (payload.role !== undefined && payload.role !== "") {
    const newRoleDoc = await findRoleForManageableAssignment(payload.role);
    if (!newRoleDoc || !allowedRoles.has(newRoleDoc._id.toString())) throwForbidden("Forbidden: You cannot assign this role to a user");
    user.role = newRoleDoc._id;
  }
};

const updateName = (user, value) => {
  const name = String(value).trim();
  if (!name) throwBadRequest("Name is required");
  if (!nameRegex.test(name)) throwBadRequest("Name must contain at least two words with at least 2 letters each");
  user.name = name;
};

const updateUsername = async (user, value, id) => {
  const username = String(value).trim().toLowerCase();
  if (!username) throwBadRequest("Username is required");
  if (!userNameRegex.test(username)) throwBadRequest("Username must be 3-16 characters and contain only letters, numbers, or underscores");
  const exists = await User.findOne({ username, _id: { $ne: id } });
  if (exists) throwConflict("Username already exists");
  user.username = username;
};

const updateEmail = async (user, value, id) => {
  const email = String(value).trim().toLowerCase();
  if (!email) throwBadRequest("Email is required");
  if (!emailRegex.test(email)) throwBadRequest("Please enter a valid email address");
  const exists = await User.findOne({ email, _id: { $ne: id } });
  if (exists) throwConflict("Email already exists");
  user.email = email;
};

const updateRole = async (user, value) => {
  if (value === undefined || value === "") return;
  const roleDocument = await findRoleByReference(value);
  user.role = roleDocument._id;
};

const updatePassword = async (user, value) => {
  const password = String(value);
  if (!password.trim()) throwBadRequest("Password cannot be empty");
  if (!passwordRegex.test(password)) throwBadRequest("Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character");
  user.password = await bcrypt.hash(password, 10);
};

const applyUserUpdates = async (user, id, payload) => {
  if (payload.name !== undefined) updateName(user, payload.name);
  if (payload.username !== undefined) await updateUsername(user, payload.username, id);
  if (payload.email !== undefined) await updateEmail(user, payload.email, id);
  if (payload.role !== undefined && payload.role !== "") await updateRole(user, payload.role);
  if (payload.password !== undefined) await updatePassword(user, payload.password);
  if (payload.isActive !== undefined) user.isActive = payload.isActive;
  if (payload.profileImage !== undefined) user.profileImage = payload.profileImage;
};

const updateUser = async (id, payload, requestingUser = null) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  await validateManageableRole(user, payload, requestingUser);
  await applyUserUpdates(user, id, payload);
  await user.save();
  return await User.findById(user._id).populate("role").select("-password -refreshToken");
};

const validateDeletePermission = async (user, requestingUser) => {
  if (!requestingUser) return;
  const reqRole = await resolveRole(requestingUser.role);
  if (reqRole?.name === "Admin") return;
  const allowedRoles = (reqRole?.manageableRoles || []).map((r) => r.toString());
  const currentRoleStr = user.role?._id ? user.role._id.toString() : user.role?.toString();
  if (!allowedRoles.includes(currentRoleStr)) throwForbidden("Forbidden: You are not authorized to delete this user");
};

const preventLastAdminDeletion = async (user) => {
  const roleName = user.role?.name || user.role;
  if (roleName !== "Admin") return;
  const adminRole = await Role.findOne({ name: "Admin" });
  const adminCount = await User.countDocuments({ role: adminRole._id });
  if (adminCount <= 1) throwBadRequest("Cannot delete the last Admin user");
};

const deleteUser = async (id, currentUserId = null, requestingUser = null) => {
  if (currentUserId && currentUserId.toString() === id.toString()) throwBadRequest("You cannot delete your own account");
  const user = await User.findById(id).populate("role");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  await validateDeletePermission(user, requestingUser);
  await preventLastAdminDeletion(user);
  await User.findByIdAndDelete(id);
  return true;
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
