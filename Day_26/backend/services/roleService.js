const Role = require("../models/role");

/* -------------------------------------------------------------------------- */
/*                              Create Role                                   */
/* -------------------------------------------------------------------------- */

const createRole = async (data) => {
  try {
    const { name, permissions = [] } = data;

    const existingRole = await Role.findOne({
      name: name.trim(),
    });

    if (existingRole) {
      throw new Error("Role already exists");
    }

    const role = await Role.create({
      name: name.trim(),
      permissions,
    });

    return role;
  } catch (error) {
    throw new Error(error.message);
  }
};

/* -------------------------------------------------------------------------- */
/*                              Get All Roles                                 */
/* -------------------------------------------------------------------------- */

const getAllRoles = async () => {
  try {
    return await Role.find().sort({
      createdAt: 1,
    });
  } catch (error) {
    throw new Error(
      `Error fetching roles: ${error.message}`
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                              Get Role By ID                                */
/* -------------------------------------------------------------------------- */

const getRoleById = async (id) => {
  try {
    return await Role.findById(id);
  } catch (error) {
    throw new Error(
      `Error fetching role: ${error.message}`
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                              Update Role                                   */
/* -------------------------------------------------------------------------- */

const updateRole = async (id, data) => {
  try {
    const role = await Role.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    return role;
  } catch (error) {
    throw new Error(
      `Error updating role: ${error.message}`
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                              Delete Role                                   */
/* -------------------------------------------------------------------------- */

const deleteRole = async (id) => {
  try {
    const role = await Role.findByIdAndDelete(id);

    if (!role) {
      const error = new Error("Role not found");
      error.statusCode = 404;
      throw error;
    }

    return role;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw new Error(
      `Error deleting role: ${error.message}`
    );
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};