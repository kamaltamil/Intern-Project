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
        `View permission is required for resource '${permission.resource}' when Create, Update, or Delete is enabled.`,
      );
      error.statusCode = 400;
      throw error;
    }
  });
};

// Check the current role's Role Management permission before accessing role data.
const hasRolePermission = (currentRole, action) =>
  currentRole?.permissions?.some(
    (permission) =>
      permission.resource === "roles" && permission.action?.[action] === true,
  );

// Check whether the target role is included in the current role's manageableRoles.
const canManageRole = (currentRole, targetRoleId) =>
  currentRole?.manageableRoles?.some(
    (role) => String(role?._id || role) === String(targetRoleId),
  );

// Enforce both the module permission and manageable-role relationship on the backend.
const validateRoleManagementAccess = (currentRole, action, targetRoleId) => {
  if (!hasRolePermission(currentRole, action)) {
    const error = new Error("Permission denied");
    error.statusCode = 403;
    throw error;
  }

  if (targetRoleId && !canManageRole(currentRole, targetRoleId)) {
    const error = new Error("You are not allowed to manage this role");
    error.statusCode = 403;
    throw error;
  }
};

// Make sure every manageable role assigned to a new or updated role can be managed by the current user.
const validateManageableRoles = (currentRole, manageableRoles = []) => {
  if (!Array.isArray(manageableRoles)) {
    const error = new Error("Manageable roles must be an array");
    error.statusCode = 400;
    throw error;
  }

  const unauthorizedRole = manageableRoles.some(
    (roleId) => !canManageRole(currentRole, roleId),
  );

  if (unauthorizedRole) {
    const error = new Error("You cannot assign a role outside your manageable roles");
    error.statusCode = 403;
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*                              Create Role                                   */
/* -------------------------------------------------------------------------- */

// Creates a role with its permissions and manageable-role relationships.
const createRole = async (data, currentRole) => {
  try {
    validateRoleManagementAccess(currentRole, "create");

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
    validateManageableRoles(currentRole, manageableRoles);

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

// Loads only roles that the current user is allowed to manage.
const getAllRoles = async (currentRole) => {
  try {
    validateRoleManagementAccess(currentRole, "view");

    const manageableRoleIds = currentRole?.manageableRoles || [];

    return await Role.find({ _id: { $in: manageableRoleIds } })
      .populate("manageableRoles", "name color")
      .sort({ createdAt: 1 });
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Error fetching roles: ${error.message}`);
  }
};

/* -------------------------------------------------------------------------- */
/*                              Get Role By ID                                */
/* -------------------------------------------------------------------------- */

// Loads a role only when the current user is allowed to manage it.
const getRoleById = async (id, currentRole) => {
  try {
    validateRoleManagementAccess(currentRole, "view", id);

    return await Role.findById(id).populate("manageableRoles", "name color");
  } catch (error) {
    if (error.statusCode) throw error;
    throw new Error(`Error fetching role: ${error.message}`);
  }
};

/* -------------------------------------------------------------------------- */
/*                               Update Role                                  */
/* -------------------------------------------------------------------------- */

// Updates a manageable role while preserving permission and relationship validation.
const updateRole = async (id, data, currentRole) => {
  try {
    validateRoleManagementAccess(currentRole, "update", id);

    if (data.permissions) validatePermissions(data.permissions);
    if (data.manageableRoles) {
      validateManageableRoles(currentRole, data.manageableRoles);
    }

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

// Deletes a role only when it is included in the current user's manageable roles.
const deleteRole = async (id, currentRole) => {
  try {
    validateRoleManagementAccess(currentRole, "delete", id);

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