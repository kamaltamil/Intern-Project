const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require("../services/roleService");

/* -------------------------------------------------------------------------- */
/*                               Create Role                                  */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               List Roles                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              Get Role By Id                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               Update Role                                  */
/* -------------------------------------------------------------------------- */

const updateRoleHandler = async (req, res) => {
  try {
    const role = await updateRole(
      req.params.id,
      req.body
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
    return res.status(400).json({
      message: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                               Delete Role                                  */
/* -------------------------------------------------------------------------- */

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