const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const User = require("../models/user");
const Role = require("../models/role");

const nameRegex = /^[a-zA-Z]{2,}(?:\s[a-zA-Z]{2,})+$/;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const userNameRegex = /^[a-zA-Z\d_]{3,16}$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@&%*+!$])[a-zA-Z\d@&%*+!$]{8,}$/;

/* -------------------------------------------------------------------------- */
/*                         Helper: Resolve User Role                          */
/* -------------------------------------------------------------------------- */

const resolveRole = async (userRoleRef) => {
  if (!userRoleRef) {
    return null;
  }

  if (
    typeof userRoleRef === "object" &&
    userRoleRef.permissions &&
    userRoleRef._id
  ) {
    return userRoleRef;
  }

  if (mongoose.Types.ObjectId.isValid(userRoleRef)) {
    return await Role.findById(userRoleRef).lean();
  }

  if (typeof userRoleRef === "string") {
    return await Role.findOne({
      name: userRoleRef,
    }).lean();
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/*                                Get All Users                               */
/* -------------------------------------------------------------------------- */

/**
 * Returns users scoped by the requesting user's manageableRoles array.
 */
const getAllUsers = async (requestingUser = null) => {
  if (!requestingUser) {
    return await User.find()
      .populate("role")
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
  }

  const roleDoc = await resolveRole(requestingUser.role);

  // Admin gets full visibility across all users
  if (roleDoc?.name === "Admin") {
    return await User.find()
      .populate("role")
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
  }

  const manageableRoles = roleDoc?.manageableRoles || [];

  if (!Array.isArray(manageableRoles) || manageableRoles.length === 0) {
    return [];
  }

  // Convert manageableRoles to ObjectIds
  const roleIds = manageableRoles.map((r) =>
    typeof r === "object" ? r._id || r : r,
  );

  return await User.find({
    role: {
      $in: roleIds,
    },
  })
    .populate("role")
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });
};

/* -------------------------------------------------------------------------- */
/*                             Get User By Id                                 */
/* -------------------------------------------------------------------------- */

const getUserById = async (id) => {
  return await User.findById(id)
    .populate("role")
    .select("-password -refreshToken");
};

/* -------------------------------------------------------------------------- */
/*                              Create User                                   */
/* -------------------------------------------------------------------------- */

const createUser = async ({
  name,
  email,
  username,
  password,
  role,
  createdBy = null,
  requestingUser = null,
}) => {
  if (!name || !email || !username || !password || !role) {
    const error = new Error(
      "Name, email, username, password and role are required",
    );

    error.statusCode = 400;
    throw error;
  }

  const normalizedName = String(name).trim();

  const normalizedEmail = String(email).trim().toLowerCase();

  const normalizedUsername = String(username).trim().toLowerCase();

  /* -------------------------- Validate fields -------------------------- */

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

  /* ----------------------- Validate role exists ----------------------- */

  let roleDocument = null;

  if (mongoose.Types.ObjectId.isValid(role)) {
    roleDocument = await Role.findById(role).lean();
  }

  if (!roleDocument) {
    roleDocument = await Role.findOne({
      name: role,
    }).lean();
  }

  if (!roleDocument) {
    const error = new Error(`Role "${role}" does not exist`);

    error.statusCode = 400;
    throw error;
  }

  /* ----------------------- Enforce manageableRoles -------------------- */

  if (requestingUser) {
    const reqRole = await resolveRole(requestingUser.role);

    if (reqRole?.name !== "Admin") {
      const allowedRoles = reqRole?.manageableRoles || [];

      const isAllowed = allowedRoles.some(
        (rId) => rId.toString() === roleDocument._id.toString(),
      );

      if (!isAllowed) {
        const error = new Error(
          "Forbidden: You are not authorized to create a user with this role",
        );

        error.statusCode = 403;
        throw error;
      }
    }
  }

  /* -------------------- Check existing email/username -------------------- */

  const existing = await User.findOne({
    $or: [
      {
        email: normalizedEmail,
      },
      {
        username: normalizedUsername,
      },
    ],
  });

  if (existing) {
    const error = new Error("Email or username already exists");

    error.statusCode = 409;
    throw error;
  }

  /* ----------------------- Hash password ----------------------- */

  const hashedPassword = await bcrypt.hash(String(password), 10);

  /* ----------------------- Create user ----------------------- */

  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    username: normalizedUsername,
    password: hashedPassword,
    role: roleDocument._id,
    createdBy,
  });

  return await User.findById(user._id)
    .populate("role")
    .select("-password -refreshToken");
};

/* -------------------------------------------------------------------------- */
/*                              Update User                                   */
/* -------------------------------------------------------------------------- */

const updateUser = async (id, payload, requestingUser = null) => {
  const user = await User.findById(id);

  if (!user) {
    const error = new Error("User not found");

    error.statusCode = 404;
    throw error;
  }

  /* ----------------------- Enforce manageableRoles -------------------- */

  if (requestingUser) {
    const reqRole = await resolveRole(requestingUser.role);

    if (reqRole?.name !== "Admin") {
      const allowedRoles = new Set(
        (reqRole?.manageableRoles || []).map((r) => r.toString()),
      );

      const currentRoleStr = user.role?.toString();

      // Check existing user's role is manageable
      if (!allowedRoles.has(currentRoleStr)) {
        const error = new Error(
          "Forbidden: You are not authorized to manage this user",
        );

        error.statusCode = 403;
        throw error;
      }

      // If updating role, check new role is also manageable
      if (payload.role !== undefined && payload.role !== "") {
        let newRoleDoc = null;

        if (mongoose.Types.ObjectId.isValid(payload.role)) {
          newRoleDoc = await Role.findById(payload.role).lean();
        }

        if (!newRoleDoc) {
          newRoleDoc = await Role.findOne({
            name: payload.role,
          }).lean();
        }

        if (!newRoleDoc || !allowedRoles.has(newRoleDoc._id.toString())) {
          const error = new Error(
            "Forbidden: You cannot assign this role to a user",
          );

          error.statusCode = 403;
          throw error;
        }

        user.role = newRoleDoc._id;
      }
    }
  }

  /* ------------------------------ Name ------------------------------ */

  if (payload.name !== undefined) {
    const name = String(payload.name).trim();

    if (!name) {
      const error = new Error("Name is required");

      error.statusCode = 400;
      throw error;
    }

    if (!nameRegex.test(name)) {
      const error = new Error(
        "Name must contain at least two words with at least 2 letters each",
      );

      error.statusCode = 400;
      throw error;
    }

    user.name = name;
  }

  /* ---------------------------- Username ---------------------------- */

  if (payload.username !== undefined) {
    const username = String(payload.username).trim().toLowerCase();

    if (!username) {
      const error = new Error("Username is required");

      error.statusCode = 400;
      throw error;
    }

    if (!userNameRegex.test(username)) {
      const error = new Error(
        "Username must be 3-16 characters and contain only letters, numbers, or underscores",
      );

      error.statusCode = 400;
      throw error;
    }

    const exists = await User.findOne({
      username,
      _id: {
        $ne: id,
      },
    });

    if (exists) {
      const error = new Error("Username already exists");

      error.statusCode = 409;
      throw error;
    }

    user.username = username;
  }

  /* ------------------------------ Email ----------------------------- */

  if (payload.email !== undefined) {
    const email = String(payload.email).trim().toLowerCase();

    if (!email) {
      const error = new Error("Email is required");

      error.statusCode = 400;
      throw error;
    }

    if (!emailRegex.test(email)) {
      const error = new Error("Please enter a valid email address");

      error.statusCode = 400;
      throw error;
    }

    const exists = await User.findOne({
      email,
      _id: {
        $ne: id,
      },
    });

    if (exists) {
      const error = new Error("Email already exists");

      error.statusCode = 409;
      throw error;
    }

    user.email = email;
  }

  /* ------------------------------ Role ------------------------------ */

  if (payload.role !== undefined && payload.role !== "") {
    let roleDocument = null;

    if (mongoose.Types.ObjectId.isValid(payload.role)) {
      roleDocument = await Role.findById(payload.role).lean();
    }

    if (!roleDocument) {
      roleDocument = await Role.findOne({
        name: payload.role,
      }).lean();
    }

    if (!roleDocument) {
      const error = new Error(`Role "${payload.role}" does not exist`);

      error.statusCode = 400;
      throw error;
    }

    user.role = roleDocument._id;
  }

  /* --------------------------- Password ----------------------------- */

  if (payload.password !== undefined) {
    const password = String(payload.password);

    if (!password.trim()) {
      const error = new Error("Password cannot be empty");

      error.statusCode = 400;
      throw error;
    }

    if (!passwordRegex.test(password)) {
      const error = new Error(
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
      );

      error.statusCode = 400;
      throw error;
    }

    user.password = await bcrypt.hash(password, 10);
  }

  /* --------------------------- Active ------------------------------- */

  if (payload.isActive !== undefined) {
    user.isActive = payload.isActive;
  }

  /* ------------------------- Profile Image -------------------------- */

  if (payload.profileImage !== undefined) {
    user.profileImage = payload.profileImage;
  }

  await user.save();

  return await User.findById(user._id)
    .populate("role")
    .select("-password -refreshToken");
};

/* -------------------------------------------------------------------------- */
/*                              Delete User                                   */
/* -------------------------------------------------------------------------- */

const deleteUser = async (id, currentUserId = null, requestingUser = null) => {
  if (currentUserId && currentUserId.toString() === id.toString()) {
    const error = new Error("You cannot delete your own account");

    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(id).populate("role");

  if (!user) {
    const error = new Error("User not found");

    error.statusCode = 404;
    throw error;
  }

  /* ----------------------- Enforce manageableRoles -------------------- */

  if (requestingUser) {
    const reqRole = await resolveRole(requestingUser.role);

    if (reqRole?.name !== "Admin") {
      const allowedRoles = (reqRole?.manageableRoles || []).map((r) =>
        r.toString(),
      );

      const currentRoleStr = user.role?._id
        ? user.role._id.toString()
        : user.role?.toString();

      if (!allowedRoles.includes(currentRoleStr)) {
        const error = new Error(
          "Forbidden: You are not authorized to delete this user",
        );

        error.statusCode = 403;
        throw error;
      }
    }
  }

  /* ---------------------- Prevent Deleting Last Admin ------------------------ */

  const roleName = user.role?.name || user.role;

  if (roleName === "Admin") {
    const adminRole = await Role.findOne({
      name: "Admin",
    });

    const adminCount = await User.countDocuments({
      role: adminRole._id,
    });

    if (adminCount <= 1) {
      const error = new Error("Cannot delete the last Admin user");

      error.statusCode = 400;
      throw error;
    }
  }

  await User.findByIdAndDelete(id);

  return true;
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
