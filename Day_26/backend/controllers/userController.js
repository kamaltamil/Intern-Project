const {
  getAllUsers,
  getUserById: getUserByIdService,
  createUser: createUserService,
  updateUser: updateUserService,
  deleteUser: deleteUserService,
} = require("../services/userService");

const {
  ok,
  created,
  badRequest,
  notFound,
  internalServerError,
} = require("../utils/response");

/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
*/
const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers(req.user);
    return ok(res, "Users fetched successfully", {users});
    // return res.status(200).json(users);
  } catch (error) {
    console.error("List users error:", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error fetching users");
    return internalServerError(res, error.message || "Error fetching users");
  }
};

/*
|--------------------------------------------------------------------------
| GET USER BY ID
|--------------------------------------------------------------------------
*/
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);

    if (!user) return notFound(res, "User not found");
    return ok(res, "User fetched successfully", {user});
  } catch (error) {
    console.error("Get user error:", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error fetching user");
    if (statusCode === 404) return notFound(res, error.message || "User not found");
    return internalServerError(res, error.message || "Error fetching user");
  }
};

/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/
const createUser = async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;

    if (!name || !email || !username || !password || !role) {
      return badRequest(res, "Name, email, username, password and role are required");
    }

    const createdBy = req.user?._id || null;
    const user = await createUserService({
      name,
      email,
      username,
      password,
      role,
      createdBy,
      requestingUser: req.user,
    });

    return created(res, "User created successfully", { user });
  } catch (error) {
    console.error("Create user error:", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error creating user");
    if (statusCode === 404) return notFound(res, error.message || "User not found");
    return internalServerError(res, error.message || "Error creating user");
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
*/
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, username, password, role, isActive } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (password !== undefined && password !== "") updateData.password = password;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (req.file) updateData.profileImage = `/uploads/profile/${req.file.filename}`;

    const user = await updateUserService(id, updateData, req.user);

    if (!user) return notFound(res, "User not found");
    return ok(res, "User updated successfully", { user });
  } catch (error) {
    console.error("Update user error:", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error updating user");
    if (statusCode === 404) return notFound(res, error.message || "User not found");
    return internalServerError(res, error.message || "Error updating user");
  }
};

/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
*/
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?._id;

    await deleteUserService(id, currentUserId, req.user);
    return ok(res, "User deleted successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error deleting user");
    if (statusCode === 404) return notFound(res, error.message || "User not found");
    return internalServerError(res, error.message || "Error deleting user");
  }
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};