const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require("../services/roleService");

// Create a role with its permissions and dashboard configuration.
const createRoleHandler = async (req, res) => {
  try {
    const role = await createRole(req.body);

    return res.status(201).json({
      message: "Role created successfully",
      role,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// Return all configured roles and their manageable role relationships.
const listRoles = async (req, res) => {
  try {
    const roles = await getAllRoles();

    return res.status(200).json(roles);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Fetch a single role for detailed inspection.
const getRole = async (req, res) => {
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
      message: error.message,
    });
  }
};

// Update the role permissions, manageable roles, or dashboard configuration.
const updateRoleHandler = async (req, res) => {
  try {
    const role = await updateRole(req.params.id, req.body);

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
    return res.status(400).json({
      message: error.message,
    });
  }
};

// Delete the selected role from the database.
const deleteRoleHandler = async (req, res) => {
  try {
    await deleteRole(req.params.id);

    return res.status(200).json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
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