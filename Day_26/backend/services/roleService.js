const Role = require("../models/role");

const validatePermissions = (permissions = []) => {
  if (!Array.isArray(permissions)) {
    const error = new Error("Permissions must be an array");
    error.statusCode = 400;
    throw error;
  }

  permissions.forEach((permission) => {
    const action = permission?.action || {};
    const hasCrudWithoutView =
      action.create === true ||
      action.update === true ||
      action.delete === true;

    if (hasCrudWithoutView && action.view !== true) {
      const error = new Error(
        `View permission is required for resource '${permission.resource}' when Create, Update, or Delete is enabled.`
      );
      error.statusCode = 400;
      throw error;
    }
  });
};

/* -------------------------------------------------------------------------- */
/*                              Create Role                                   */
/* -------------------------------------------------------------------------- */

const createRole = async (data) => {
  try {
    const { name, permissions = [], manageableRoles = [], description = "", color, isDefault = false } = data;

    validatePermissions(permissions);

    const existingRole = await Role.findOne({ name: name.trim() });
    if (existingRole) throw new Error("Role already exists");

    return await Role.create({
      name: name.trim(),
      permissions,
      manageableRoles,
      description,
      color,
      isDefault,
    });
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(error.message);
  }
};

/* -------------------------------------------------------------------------- */
/*                              Get All Roles                                 */
/* -------------------------------------------------------------------------- */

const getAllRoles = async () => {
  try {
    return await Role.find()
      .populate("manageableRoles", "name color")
      .sort({ createdAt: 1 });
  } catch (error) {
    throw new Error(`Error fetching roles: ${error.message}`);
  }
};

/* -------------------------------------------------------------------------- */
/*                              Get Role By ID                                */
/* -------------------------------------------------------------------------- */

const getRoleById = async (id) => {
  try {
    return await Role.findById(id).populate("manageableRoles", "name color");
  } catch (error) {
    throw new Error(`Error fetching role: ${error.message}`);
  }
};

/* -------------------------------------------------------------------------- */
/*                              Update Role                                   */
/* -------------------------------------------------------------------------- */

const updateRole = async (id, data) => {
  try {
    if (data.permissions) validatePermissions(data.permissions);

    const role = await Role.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("manageableRoles", "name color");

    return role;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Error updating role: ${error.message}`);
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
    if (error.statusCode) throw error;
    throw new Error(`Error deleting role: ${error.message}`);
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};