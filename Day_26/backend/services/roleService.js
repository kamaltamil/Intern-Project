const Role = require("../models/role");
const MODULES = require("../constants/modules");

/**
 * Create default permission list
 */
const getDefaultPermissions = () => {
  return Object.values(MODULES).map((module) => ({
    resource: module,
    action: {
      view: false,
      create: false,
      update: false,
      delete: false,
    },
  }));
};

/**
 * Create Role
 */
const createRole = async (payload) => {
  const {
    name,
    description = "",
    color = "#722ed1",
    permissions,
    isDefault = false,
  } = payload;

  const existingRole = await Role.findOne({
    name: name.trim(),
  });

  if (existingRole) {
    const error = new Error("Role already exists");
    error.statusCode = 409;
    throw error;
  }

  if (isDefault) {
    await Role.updateMany(
      {},
      {
        isDefault: false,
      }
    );
  }

  const role = await Role.create({
    name: name.trim(),
    description,
    color,
    permissions:
      permissions && permissions.length > 0
        ? permissions
        : getDefaultPermissions(),
    isDefault,
  });

  return role;
};

/**
 * Get All Roles
 */
const getAllRoles = async () => {
  return await Role.find().sort({
    isSystem: -1,
    name: 1,
  });
};

/**
 * Get Role By Id
 */
const getRoleById = async (id) => {
  return await Role.findById(id);
};

/**
 * Update Role
 */
const updateRole = async (id, payload) => {
  const role = await Role.findById(id);

  if (!role) {
    throw new Error("Role not found");
  }

  if (
    payload.name &&
    payload.name.trim().toLowerCase() !==
      role.name.trim().toLowerCase()
  ) {
    const exists = await Role.findOne({
      name: payload.name.trim(),
      _id: { $ne: id },
    });

    if (exists) {
      const error = new Error("Role already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  if (payload.isDefault) {
    await Role.updateMany(
      {},
      {
        isDefault: false,
      }
    );
  }

  role.name = payload.name ?? role.name;
  role.description = payload.description ?? role.description;
  role.color = payload.color ?? role.color;
  role.permissions =
    payload.permissions ?? role.permissions;
  role.isDefault =
    payload.isDefault ?? role.isDefault;

  await role.save();

  return role;
};

/**
 * Delete Role
 */
const deleteRole = async (id) => {
  const role = await Role.findById(id);

  if (!role) {
    throw new Error("Role not found");
  }

  if (role.isSystem) {
    const error = new Error(
      "System roles cannot be deleted"
    );
    error.statusCode = 403;
    throw error;
  }

  return await Role.findByIdAndDelete(id);
};

/**
 * Get Default Role
 */
const getDefaultRole = async () => {
  return await Role.findOne({
    isDefault: true,
  });
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getDefaultRole,
  getDefaultPermissions,
};