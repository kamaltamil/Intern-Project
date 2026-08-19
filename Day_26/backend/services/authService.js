const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const mongoose = require("mongoose");

const User = require("../models/user");
const Role = require("../models/role");
const logger = require("../config/logger");

// Reuse the common validation patterns defined for the application.
const {
  namePattern,
  usernamePattern,
  emailPattern,
  passwordPattern,
} = require("../validators/patterns");

// Use environment variables for JWT secrets.
// Development fallback values are kept unchanged.
const accessSecret = process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

/**
 * Normalize permissions returned from the Role document.
 *
 * This keeps the permission structure consistent even if
 * the database contains "action" or "actions".
 */
const normalizePermissions = (permissions = []) => {
  // Make sure permissions is always treated as an array.
  if (!Array.isArray(permissions)) return [];

  // Normalize every permission into the expected structure.
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
 * Create a new access token for the authenticated user.
 *
 * The token contains the user ID and role so that
 * authentication and permission checks can use them.
 */
const createAccessToken = (userId, roleName) =>
  jwt.sign(
    {
      sub: userId.toString(),
      userId: userId.toString(),
      role: roleName,
    },
    accessSecret,
    {
      expiresIn: "1h",
    },
  );

/**
 * Create a new refresh token.
 *
 * A unique JWT ID is generated for every refresh token.
 */
const createRefreshToken = (userId) =>
  jwt.sign(
    {
      userId: userId.toString(),
      jti: crypto.randomUUID(),
    },
    refreshSecret,
    {
      expiresIn: "7d",
    },
  );

/**
 * Find a role document using either:
 * - an already populated role object
 * - a MongoDB ObjectId
 * - a role name
 */
const getRoleDocument = async (roleRef) => {
  // No role reference was supplied.
  if (!roleRef) return null;

  // The role is already populated as an object.
  if (typeof roleRef === "object" && roleRef.name) {
    return roleRef;
  }

  // Try to find the role using its MongoDB ObjectId.
  if (mongoose.Types.ObjectId.isValid(roleRef)) {
    const roleDoc = await Role.findById(roleRef).lean();

    if (roleDoc) return roleDoc;
  }

  // If ObjectId lookup failed, try finding the role by name.
  return await Role.findOne({ name: roleRef }).lean();
};

/**
 * Get normalized permissions for a role.
 */
const getRolePermissions = async (roleRef) => {
  // Resolve the role document first.
  const roleDoc = await getRoleDocument(roleRef);

  // Return an empty permission list if the role does not exist.
  if (!roleDoc) return [];

  // Normalize the role permissions before returning them.
  return normalizePermissions(roleDoc.permissions);
};

/**
 * Generate access and refresh tokens and store
 * the hashed refresh token in the user document.
 */
const generateAndStoreTokens = async (userId, roleName) => {
  // Create a short-lived access token.
  const token = createAccessToken(userId, roleName);

  // Create a long-lived refresh token.
  const refreshToken = createRefreshToken(userId);

  // Hash the refresh token before storing it in the database.
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  // Store only the hashed refresh token.
  await User.findByIdAndUpdate(userId, {
    refreshToken: hashedRefreshToken,
  });

  // Return the original tokens to the caller.
  return {
    token,
    refreshToken,
  };
};

/**
 * Create a standard validation error.
 *
 * This keeps validation errors consistent across
 * registration and profile update operations.
 */
const throwValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;

  throw error;
};

/**
 * Validate and normalize a user's name.
 */
const validateName = (value) => {
  // Convert the value to a string and remove unnecessary spaces.
  const name = String(value).trim();

  // Make sure a name was provided.
  if (!name) {
    throwValidationError("Name is required");
  }

  // Validate the name format using the shared pattern.
  if (!namePattern.test(name)) {
    throwValidationError(
      "Name must contain at least two words with at least 2 letters each",
    );
  }

  // Return the normalized name.
  return name;
};

/**
 * Validate and normalize an email address.
 */
const validateEmailFormat = (value) => {
  // Trim spaces and convert the email to lowercase.
  const email = String(value).trim().toLowerCase();

  // Make sure an email was provided.
  if (!email) {
    throwValidationError("Email is required");
  }

  // Validate the email format.
  if (!emailPattern.test(email)) {
    throwValidationError("Please enter a valid email address");
  }

  // Return the normalized email.
  return email;
};

/**
 * Validate and normalize a username.
 */
const validateUsernameFormat = (value) => {
  // Trim spaces and convert the username to lowercase.
  const username = String(value).trim().toLowerCase();

  // Make sure a username was provided.
  if (!username) {
    throwValidationError("Username is required");
  }

  // Validate the username format.
  if (!usernamePattern.test(username)) {
    throwValidationError(
      "Username must be 3-16 characters and contain only letters, numbers, or underscores",
    );
  }

  // Return the normalized username.
  return username;
};

/**
 * Validate a password and hash it.
 *
 * Password hashing is performed only after the password
 * passes the required format validation.
 */
const validateAndHashPassword = async (value) => {
  // Convert the password to a string.
  const password = String(value);

  // Make sure the password is not empty.
  if (!password.trim()) {
    throwValidationError("Password cannot be empty");
  }

  // Validate password strength.
  if (!passwordPattern.test(password)) {
    throwValidationError(
      "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
    );
  }

  // Hash the password before storing it.
  return await bcrypt.hash(password, 10);
};

/**
 * Register a new user.
 */
const registerUser = async ({ name, email, username, password, role }) => {
  // Step 1: Check that all mandatory registration fields are provided.
  if (!name || !email || !username || !password) {
    const error = new Error("Name, email, username and password are required");
    error.statusCode = 400;
    throw error;
  }

  // Step 2: Validate and normalize the user's name.
  const normalizedName = validateName(name);

  // Step 3: Validate and normalize the user's email.
  const normalizedEmail = validateEmailFormat(email);

  // Step 4: Validate and normalize the user's username.
  const normalizedUsername = validateUsernameFormat(username);

  // Step 5: Validate the password and hash it.
  const hashedPassword = await validateAndHashPassword(password);

  // Step 6: Check whether the email or username is already registered.
  // const existingUser = await User.findOne({
  //   $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  // });

  // Step 7: Stop registration if a duplicate user is found.
  // if (existingUser) {
  //   const error = new Error("Email or username already exists");

  //   error.statusCode = 409;

  //   throw error;
  // }

  const existingUserMail = await User.findOne({
    email: normalizedEmail
  });
  if (existingUserMail) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }
  const existingUsername = await User.findOne({
    username: normalizedUsername
  });
  if (existingUsername) {
    const error = new Error("Username already exists");
    error.statusCode = 409;
    throw error;
  }



  // Step 8: Try to resolve the requested role.
  let roleDoc = null;

  if (role) {
    roleDoc = await getRoleDocument(role);
  }

  // Step 9: If no requested role was found, use the system default role.
  if (!roleDoc) {
    roleDoc = await Role.findOne({
      isDefault: true,
    }).lean();
  }

  // Step 10: Fall back to the Member role if no default role exists.
  if (!roleDoc) {
    roleDoc = await Role.findOne({
      name: "Member",
    }).lean();
  }

  // Step 11: Stop registration if no usable role exists.
  if (!roleDoc) {
    const error = new Error("No default role found in system");

    error.statusCode = 400;

    throw error;
  }

  // Step 12: Create the user using normalized values
  // and the already hashed password.
  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    username: normalizedUsername,
    password: hashedPassword,
    role: roleDoc._id,
  });

  // Step 13: Return the user information required by the caller.
  // The password and refresh token are intentionally not returned.
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: roleDoc.name,
    roleColor: roleDoc.color || "#722ed1",
  };
};

/**
 * Authenticate a user using either email or username.
 */
const loginUser = async (identifier, password) => {
  // Step 1: Make sure both login credentials were provided.
  if (!identifier || !password) {
    const error = new Error("Email/username and password are required");

    error.statusCode = 400;

    throw error;
  }

  // Step 2: Normalize the login identifier.
  const normalizedIdentifier = String(identifier).trim();

  // Step 3: Reject an identifier that becomes empty after trimming.
  if (!normalizedIdentifier) {
    const error = new Error("Email/username and password are required");

    error.statusCode = 400;

    throw error;
  }

  // Step 4: Find the user using either email or username.
  // Populate the role because login needs role and permission information.
  const user = await User.findOne({
    $or: [
      {
        email: normalizedIdentifier.toLowerCase(),
      },
      {
        username: normalizedIdentifier.toLowerCase(),
      },
    ],
  }).populate("role");

  // Step 5: Reject the login if the user does not exist.
  if (!user) {
    const error = new Error("Invalid credentials");

    error.statusCode = 401;

    throw error;
  }

  // Step 6: Compare the supplied password with the stored hash.
  const passwordMatch = await bcrypt.compare(String(password), user.password);

  // Step 7: Reject the login when the password is incorrect.
  if (!passwordMatch) {
    const error = new Error("Invalid credentials");

    error.statusCode = 401;

    throw error;
  }

  // Step 8: Resolve the user's role document.
  const roleDoc = user.role?.name
    ? user.role
    : await getRoleDocument(user.role);

  // Step 9: Determine the role name.
  const roleName = roleDoc?.name || "Member";

  // Step 10: Normalize the permissions assigned to the role.
  const permissions = normalizePermissions(roleDoc?.permissions || []);

  // Step 11: Generate new access and refresh tokens.
  const tokens = await generateAndStoreTokens(user._id, roleName);

  // Step 12: Return the authenticated user and authorization data.
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
    roleDoc,
    dashboardConfig: roleDoc?.dashboardConfig,
    permissions,
  };
};

/**
 * Generate a new access token using a refresh token.
 */
const refreshAccessToken = async (refreshToken) => {
  // Step 1: Make sure a refresh token was supplied.
  if (!refreshToken) {
    const error = new Error("Refresh token is required");

    error.statusCode = 400;

    throw error;
  }

  let decoded;

  try {
    // Step 2: Verify the refresh token signature and expiration.
    decoded = jwt.verify(refreshToken, refreshSecret);
  } catch (error) {
    // Step 3: Convert JWT verification failures into
    // a consistent authentication error.
    const authError = new Error("Invalid or expired refresh token");

    authError.statusCode = 401;

    logger.error("Refresh token verification failed", error);

    throw authError;
  }

  // Step 4: Extract the user ID from the verified token.
  const userId = decoded.userId || decoded.sub;

  // Step 5: Reject tokens that do not contain a user ID.
  if (!userId) {
    const error = new Error("Invalid refresh token payload");

    error.statusCode = 401;

    logger.error("Refresh token payload missing userId", decoded);

    throw error;
  }

  // Step 6: Find the user and populate the role.
  const user = await User.findById(userId).populate("role");

  // Step 7: Make sure the user has a stored refresh token.
  if (!user?.refreshToken) {
    const error = new Error("Invalid refresh token");

    error.statusCode = 401;

    logger.error("Refresh token not found for user", { userId });

    throw error;
  }

  // Step 8: Compare the supplied refresh token
  // with the hashed token stored in the database.
  const refreshTokenMatch = await bcrypt.compare(
    refreshToken,
    user.refreshToken,
  );

  // Step 9: Reject the request if the tokens do not match.
  if (!refreshTokenMatch) {
    const error = new Error("Invalid refresh token");

    error.statusCode = 401;

    logger.error("Refresh token does not match for user", { userId });

    throw error;
  }

  // Step 10: Resolve the user's role.
  const roleDoc = user.role?.name
    ? user.role
    : await getRoleDocument(user.role);

  // Step 11: Determine the role name and permissions.
  const roleName = roleDoc?.name || "Member";
  const permissions = normalizePermissions(roleDoc?.permissions || []);

  // Step 12: Create a new access token.
  const newToken = createAccessToken(user._id, roleName);

  // Step 13: Rotate the refresh token.
  const newRefreshToken = createRefreshToken(user._id);

  // Step 14: Hash the new refresh token before storing it.
  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

  // Step 15: Replace the old refresh token in the database.
  await User.findByIdAndUpdate(user._id, {
    refreshToken: hashedRefreshToken,
  });

  // Step 16: Return the newly generated tokens.
  return {
    token: newToken,
    refreshToken: newRefreshToken,
    role: roleName,
    permissions,
  };
};

/**
 * Get the authenticated user's profile.
 */
const getProfile = async (userId) => {
  // Step 1: Find the user and populate the role.
  const user = await User.findById(userId).populate("role").lean();

  // Step 2: Return null when the user no longer exists.
  if (!user) return null;

  // Step 3: Resolve the role document.
  const roleDoc = user.role?.name
    ? user.role
    : await getRoleDocument(user.role);

  // Step 4: Determine the role name.
  const roleName = roleDoc?.name || "Member";

  // Step 5: Normalize the role permissions.
  const permissions = normalizePermissions(roleDoc?.permissions || []);

  // Step 6: Return the profile and authorization information.
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
    roleDoc,
    dashboardConfig: roleDoc?.dashboardConfig,
    permissions,
  };
};

/**
 * Validate the email during profile update and
 * make sure another user is not already using it.
 */
const validateProfileEmail = async (value, userId) => {
  // Step 1: Validate and normalize the email format.
  const email = validateEmailFormat(value);

  // Step 2: Search for another user using the same email.
  const existing = await User.findOne({
    email,
    _id: { $ne: userId },
  });

  // Step 3: Reject the update if another user owns the email.
  if (existing) {
    const error = new Error("Email already exists");

    error.statusCode = 409;

    logger.error("Attempt to use existing email", {
      userId,
      email,
    });

    throw error;
  }

  // Step 4: Return the normalized email.
  return email;
};

/**
 * Validate the username during profile update and
 * make sure another user is not already using it.
 */
const validateProfileUsername = async (value, userId) => {
  // Step 1: Validate and normalize the username format.
  const username = validateUsernameFormat(value);

  // Step 2: Search for another user using the same username.
  const existing = await User.findOne({
    username,
    _id: { $ne: userId },
  });

  // Step 3: Reject the update if another user owns the username.
  if (existing) {
    const error = new Error("Username already exists");

    error.statusCode = 409;

    logger.error("Attempt to use existing username", {
      userId,
      username,
    });

    throw error;
  }

  // Step 4: Return the normalized username.
  return username;
};

/**
 * Update the authenticated user's own profile.
 */
const updateOwnProfile = async (userId, payload) => {
  // Step 1: Find the authenticated user.
  const user = await User.findById(userId);

  // Step 2: Stop if the user no longer exists.
  if (!user) {
    const error = new Error("User not found");

    error.statusCode = 404;

    throw error;
  }

  // Step 3: Validate and update the name when it was supplied.
  if (payload.name !== undefined) {
    user.name = validateName(payload.name);
  }

  // Step 4: Validate the email and check for duplicates.
  if (payload.email !== undefined) {
    user.email = await validateProfileEmail(payload.email, userId);
  }

  // Step 5: Validate the username and check for duplicates.
  if (payload.username !== undefined) {
    user.username = await validateProfileUsername(payload.username, userId);
  }

  // Step 6: Validate and hash the new password.
  if (payload.password !== undefined) {
    user.password = await validateAndHashPassword(payload.password);
  }

  // Step 7: Update the profile image when supplied.
  if (payload.profileImage !== undefined) {
    user.profileImage = payload.profileImage;
  }

  // Step 8: Save all validated changes.
  await user.save();

  // Step 9: Return the updated profile using the existing profile flow.
  return await getProfile(user._id);
};

/**
 * Delete the authenticated user's own profile.
 */
const deleteOwnProfile = async (userId) => {
  // Step 1: Find the user and populate the role.
  const user = await User.findById(userId).populate("role");

  // Step 2: Stop if the user does not exist.
  if (!user) {
    const error = new Error("User not found");

    error.statusCode = 404;

    throw error;
  }

  // Step 3: Determine the user's role.
  const roleName = user.role?.name || user.role;

  // Step 4: Prevent deletion of the final Admin account.
  if (roleName === "Admin") {
    const adminRole = await Role.findOne({
      name: "Admin",
    });

    if (adminRole) {
      // Count the remaining Admin accounts.
      const adminCount = await User.countDocuments({
        role: adminRole._id,
      });

      // Stop the deletion if this is the last Admin.
      if (adminCount <= 1) {
        const error = new Error("Cannot delete the last Admin account");

        error.statusCode = 400;

        logger.error("Attempt to delete the last Admin account", { userId });

        throw error;
      }
    }
  }

  // Step 5: Delete the user's account.
  await User.findByIdAndDelete(userId);

  // Step 6: Return success to the caller.
  return true;
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getProfile,
  updateOwnProfile,
  deleteOwnProfile,
  createAccessToken,
  createRefreshToken,
  generateAndStoreTokens,
  getRolePermissions,
  getRoleDocument,
};
