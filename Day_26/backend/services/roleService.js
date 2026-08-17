const Role = require("../models/role");

// Ensures Create, Update, and Delete permissions are only assigned when View is enabled.
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

// Creates a role with its permissions and manageable-role relationships.
const createRole = async (data) => {
  try {
    const {
      name,
      permissions = [],
      manageableRoles = [],
      description = "",
      color,
      isDefault = false,
      dashboardConfig,
    } = data;

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
      dashboardConfig,
    });
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(error.message);
  }
};

/* -------------------------------------------------------------------------- */
/*                              Get All Roles                                 */
/* -------------------------------------------------------------------------- */

// Loads all roles and populates manageable roles for display and management checks.
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

// Loads one role together with the names and colors of its manageable roles.
const getRoleById = async (id) => {
  try {
    return await Role.findById(id).populate("manageableRoles", "name color");
  } catch (error) {
    throw new Error(`Error fetching role: ${error.message}`);
  }
};

/* -------------------------------------------------------------------------- */
/*                               Update Role                                  */
/* -------------------------------------------------------------------------- */

// Updates a role while preserving permission validation and returning populated relationships.
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
/*                               Delete Role                                  */
/* -------------------------------------------------------------------------- */

// Deletes a role and reports a not-found status when the role does not exist.
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