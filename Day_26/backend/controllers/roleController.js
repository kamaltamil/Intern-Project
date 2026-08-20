const logger = require("../config/logger");
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require("../services/roleService");

const {
  ok,
  created,
  badRequest,
  notFound,
  internalServerError,
} = require("../utils/response");

// Create a role after checking the current user's role-management permissions.
const createRoleHandler = async (req, res) => {
  try {
    const role = await createRole(req.body, req.user?.role);
    logger.info("Role created successfully", { roleId: role._id, createdBy: req.user?._id });
    return created(res, "Role created successfully", { role });
  } catch (error) {
    logger.error("Failed to create role", { error: error.message, stack: error.stack });
    const statusCode = error.statusCode || 400;
    if (statusCode === 404) return notFound(res, error.message || "Role not found");
    if (statusCode === 400) return badRequest(res, error.message || "Error creating role");
    return internalServerError(res, error.message || "Error creating role");
  }
};

// Return only the roles the current user is allowed to manage.
const listRoles = async (req, res) => {
  try {
    const roles = await getAllRoles(req.user?.role);
    logger.info("Roles fetched successfully", { fetchedBy: req.user?._id, roleCount: roles.length });
    return ok(res, "Roles fetched successfully", { roles });
  } catch (error) {
    logger.error("Roles fetched failed", { error: error.message, stack: error.stack });
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error fetching roles");
    return internalServerError(res, error.message || "Error fetching roles");
  }
};

// Fetch a role only after the service verifies that it is manageable.
const getRole = async (req, res) => {
  try {
    const role = await getRoleById(req.params.id, req.user?.role);
    if (!role) return notFound(res, "Role not found");
    return ok(res, "Role fetched successfully", {role});
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 400) return badRequest(res, error.message || "Error fetching role");
    if (statusCode === 404) return notFound(res, error.message || "Role not found");
    return internalServerError(res, error.message || "Error fetching role");
  }
};

// Update a role only when the current user can manage the target role.
const updateRoleHandler = async (req, res) => {
  try {
    const role = await updateRole(req.params.id, req.body, req.user?.role);
    if (!role) return notFound(res, "Role not found");
    return ok(res, "Role updated successfully", { role });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    if (statusCode === 404) return notFound(res, error.message || "Role not found");
    if (statusCode === 400) return badRequest(res, error.message || "Error updating role");
    return internalServerError(res, error.message || "Error updating role");
  }
};

// Delete a role only when it is included in the current user's manageable roles.
const deleteRoleHandler = async (req, res) => {
  try {
    await deleteRole(req.params.id, req.user?.role);
    return ok(res, "Role deleted successfully");
  } catch (error) {
    const statusCode = error.statusCode || 400;
    if (statusCode === 404) return notFound(res, error.message || "Role not found");
    if (statusCode === 400) return badRequest(res, error.message || "Error deleting role");
    return internalServerError(res, error.message || "Error deleting role");
  }
};

module.exports = {
  createRoleHandler,
  listRoles,
  getRole,
  updateRoleHandler,
  deleteRoleHandler,
};