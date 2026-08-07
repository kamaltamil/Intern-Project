const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require("../services/roleService");

/**
 * Create Role
 */
const createRoleHandler = async (req, res) => {
  try {
    const {
      name,
      description,
      color,
      permissions,
      isDefault,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Role name is required",
      });
    }

    const role = await createRole({
      name,
      description,
      color,
      permissions,
      isDefault,
    });

    return res.status(201).json({
      message: "Role created successfully",
      role,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode === 409
          ? "Role already exists"
          : error.message || "Failed to create role",
    });
  }
};

/**
 * Get All Roles
 */
const listRoles = async (req, res) => {
  try {
    const roles = await getAllRoles();

    return res.status(200).json(roles);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch roles", error
    });
  }
};

/**
 * Get Single Role
 */
const getRoleHandler = async (req, res) => {
  try {
    const role = await getRoleById(req.params.id);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch role", error
    });
  }
};

/**
 * Update Role
 */
const updateRoleHandler = async (req, res) => {
  try {
    const updatedRole = await updateRole(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      message: "Role updated successfully",
      role: updatedRole,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

/**
 * Delete Role
 */
const deleteRoleHandler = async (req, res) => {
  try {
    await deleteRole(req.params.id);

    return res.status(200).json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRoleHandler,
  listRoles,
  getRoleHandler,
  updateRoleHandler,
  deleteRoleHandler,
};