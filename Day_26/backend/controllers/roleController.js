const logger = require("../config/logger");
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require("../services/roleService");

// Create a role after checking the current user's role-management permissions.
const createRoleHandler = async (req, res) => {
  try {
    const role = await createRole(req.body, req.user?.role);
    logger.info("Role created successfully", { roleId: role._id, createdBy: req.user?._id });

    return res.status(201).json({
      message: "Role created successfully",
      role,
    });
  } catch (error) {
    logger.error("Failed to create role", { error: error.message, stack: error.stack });
    return res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};

// Return only the roles the current user is allowed to manage.
const listRoles = async (req, res) => {
  try {
    const roles = await getAllRoles(req.user?.role);
    logger.info("Roles fetched successfully", { fetchedBy: req.user?._id, roleCount: roles.length });

    return res.status(200).json(roles);
  } catch (error) {
    logger.error("Roles fetched failed", { error: error.message, stack: error.stack });
    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

// Fetch a role only after the service verifies that it is manageable.
const getRole = async (req, res) => {
  try {
    const role = await getRoleById(req.params.id, req.user?.role);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    return res.status(200).json(role);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

// Update a role only when the current user can manage the target role.
const updateRoleHandler = async (req, res) => {
  try {
    const role = await updateRole(
      req.params.id,
      req.body,
      req.user?.role,
    );

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    return res.status(200).json({
      message: "Role updated successfully",
      role,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};

// Delete a role only when it is included in the current user's manageable roles.
const deleteRoleHandler = async (req, res) => {
  try {
    await deleteRole(req.params.id, req.user?.role);

    return res.status(200).json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRoleHandler,
  listRoles,
  getRole,
  updateRoleHandler,
  deleteRoleHandler,
};