const {
  getAllUsers,
  getUserById: getUserByIdService,
  createUser: createUserService,
  updateUser: updateUserService,
  deleteUser: deleteUserService,
} = require("../services/userService");

/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
|
| Requires: users.view = true
| Scope: Filtered by requesting user's role.manageableRoles
|
*/

const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers(req.user);

    return res.status(200).json(users);
  } catch (error) {
    console.error("List users error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Error fetching users",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET USER BY ID
|--------------------------------------------------------------------------
|
| Requires: users.view = true
|
*/

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Error fetching user",
    });
  }
};


/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
|
| Requires: users.create = true
| Scope: Target role must be in requesting user's manageableRoles
|
*/

const createUser = async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;

    if (!name || !email || !username || !password || !role) {
      return res.status(400).json({
        message: "Name, email, username, password and role are required",
      });
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

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Create user error:", error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      message: error.message || "Error creating user",
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
|
| Requires: users.update = true
| Scope: Target user & new role must be in requesting user's manageableRoles
|
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

    if (req.file) {
      updateData.profileImage = `/uploads/profile/${req.file.filename}`;
    }

    const user = await updateUserService(id, updateData, req.user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      message: error.message || "Error updating user",
    });
  }
};


/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
|
| Requires: users.delete = true
| Scope: Target user's role must be in requesting user's manageableRoles
|
*/

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const currentUserId = req.user?._id;

    await deleteUserService(id, currentUserId, req.user);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      message: error.message || "Error deleting user",
    });
  }
};


module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};