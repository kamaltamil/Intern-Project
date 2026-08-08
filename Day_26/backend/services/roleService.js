const Role = require("../models/role");
const User = require("../models/user");
const MODULES = require("../constants/modules");

/* -------------------------------------------------------------------------- */
/*                           Permission Validation                            */
/* -------------------------------------------------------------------------- */

const buildPermissions = (permissions = []) => {
  return Object.values(MODULES).map((resource) => {
    const existing = permissions.find(
      (item) => item.resource === resource
    );

    const rawCreate = existing?.action?.create || false;
    const rawUpdate = existing?.action?.update || false;
    const rawDelete = existing?.action?.delete || false;

    const view =
      existing?.action?.view ||
      rawCreate ||
      rawUpdate ||
      rawDelete ||
      false;

    return {
      resource,
      action: {
        view,
        create: rawCreate,
        update: rawUpdate,
        delete: rawDelete,
      },
    };
  });
};

/* -------------------------------------------------------------------------- */
/*                              Create Role                                   */
/* -------------------------------------------------------------------------- */

const createRole = async ({
  name,
  description,
  color,
  permissions,
  isDefault = false,
  manageableRoles = [],
}) => {
  if (!name || !name.trim()) {
    const error = new Error("Role name is required");
    error.statusCode = 400;
    throw error;
  }

  const exists = await Role.findOne({
    name: new RegExp(`^${name.trim()}$`, "i"),
  });

  if (exists) {
    const error = new Error("A role with this name already exists");
    error.statusCode = 409;
    throw error;
  }

  const existingDefault = await Role.findOne({ isDefault: true });

  if (isDefault) {
    await Role.updateMany({}, { isDefault: false });
  } else if (!existingDefault) {
    isDefault = true;
  }

  const role = await Role.create({
    name: name.trim(),
    description: description?.trim() || "",
    color: color || "#722ed1",
    isDefault,
    permissions: buildPermissions(permissions),
    manageableRoles: Array.isArray(manageableRoles) ? manageableRoles : [],
  });

  return role;
};

/* -------------------------------------------------------------------------- */
/*                               Get All Roles                                */
/* -------------------------------------------------------------------------- */

const getAllRoles = async () => {
  return await Role.find()
    .populate("manageableRoles", "name color _id")
    .sort({ createdAt: 1 });
};

/* -------------------------------------------------------------------------- */
/*                              Get Role By Id                                */
/* -------------------------------------------------------------------------- */

const getRoleById = async (id) => {
  return await Role.findById(id).populate("manageableRoles", "name color _id");
};

/* -------------------------------------------------------------------------- */
/*                              Update Role                                   */
/* -------------------------------------------------------------------------- */

const updateRole = async (
  id,
  {
    name,
    description,
    color,
    permissions,
    isDefault,
    manageableRoles,
  }
) => {
  const role = await Role.findById(id);

  if (!role) {
    const error = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }

  /* ------------------------ Duplicate Name Check ------------------------ */

  if (name && name.trim().toLowerCase() !== role.name.toLowerCase()) {
    const exists = await Role.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
      _id: { $ne: id },
    });

    if (exists) {
      const error = new Error("A role with this name already exists");
      error.statusCode = 409;
      throw error;
    }

    if (role.isSystem) {
      const error = new Error("System role name cannot be changed");
      error.statusCode = 400;
      throw error;
    }

    role.name = name.trim();
  }

  /* ---------------------- Description ---------------------- */

  if (description !== undefined) {
    role.description = description;
  }

  /* ------------------------- Color -------------------------- */

  if (color !== undefined) {
    role.color = color;
  }

  /* --------------------- Default Role Enforcements ----------------------- */

  if (isDefault === true) {
    await Role.updateMany({ _id: { $ne: id } }, { isDefault: false });
    role.isDefault = true;
  } else if (isDefault === false) {
    if (role.isDefault) {
      const otherDefault = await Role.findOne({
        _id: { $ne: id },
        isDefault: true,
      });

      if (!otherDefault) {
        const error = new Error(
          "Cannot remove default status. The system must always have exactly one default role. Please assign another role as default first."
        );
        error.statusCode = 400;
        throw error;
      }

      role.isDefault = false;
    }
  }

  /* ---------------------- Permissions ----------------------- */

  if (permissions) {
    role.permissions = buildPermissions(permissions);
  }

  /* ------------------- Manageable Roles -------------------- */

  if (manageableRoles !== undefined) {
    role.manageableRoles = Array.isArray(manageableRoles) ? manageableRoles : [];
  }

  await role.save();

  return await Role.findById(id).populate("manageableRoles", "name color _id");
};

/* -------------------------------------------------------------------------- */
/*                              Delete Role                                   */
/* -------------------------------------------------------------------------- */

const deleteRole = async (id) => {
  const role = await Role.findById(id);

  if (!role) {
    const error = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }

  if (role.isSystem) {
    const error = new Error("System roles cannot be deleted");
    error.statusCode = 400;
    throw error;
  }

  const assignedUsers = await User.countDocuments({
    $or: [{ role: role._id }, { role: role.name }],
  });

  if (assignedUsers > 0) {
    const error = new Error(
      `Cannot delete: ${assignedUsers} user(s) are assigned to this role`
    );
    error.statusCode = 400;
    throw error;
  }

  if (role.isDefault) {
    const nextDefault = await Role.findOne({ _id: { $ne: id } });
    if (nextDefault) {
      nextDefault.isDefault = true;
      await nextDefault.save();
    }
  }

  // Remove deleted role ID from all manageableRoles arrays across all roles
  await Role.updateMany({}, { $pull: { manageableRoles: id } });

  await Role.findByIdAndDelete(id);

  return true;
};

/* -------------------------------------------------------------------------- */
/*                           Default Role                                     */
/* -------------------------------------------------------------------------- */

const getDefaultRole = async () => {
  let defaultRole = await Role.findOne({ isDefault: true });
  if (!defaultRole) {
    defaultRole = await Role.findOne({ name: "Member" }) || await Role.findOne();
    if (defaultRole) {
      defaultRole.isDefault = true;
      await defaultRole.save();
    }
  }
  return defaultRole;
};

/* -------------------------------------------------------------------------- */
/*                     Get Default Permissions                                */
/* -------------------------------------------------------------------------- */

const getDefaultPermissions = async () => {
  const role = await getDefaultRole();

  if (!role) {
    return [];
  }

  return role.permissions;
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getDefaultRole,
  getDefaultPermissions,
  buildPermissions,
};