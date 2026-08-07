const Role = require('../models/role');
const User = require('../models/users');
const MODULE_LIST = require('../constants/modules');

const VALID_MODULES = Object.values(MODULE_LIST);

/**
 * Enforces the view/create/update/delete dependency rule server-side:
 * if any of create/update/delete is true, view is forced true too.
 * Unknown resources are dropped.
 */
const normalizePermissions = (permissions = []) => {
    return permissions
        .filter((permission) => VALID_MODULES.includes(permission.resource))
        .map(({ resource, action = {} }) => {
            const create = Boolean(action.create);
            const update = Boolean(action.update);
            const del = Boolean(action.delete);
            const view = Boolean(action.view) || create || update || del;

            return { resource, action: { view, create, update, delete: del } };
        });
};

const createRole = async ({ name, description, color }) => {
    const existing = await Role.findOne({ name: name.trim() });

    if (existing) {
        const err = new Error('Role already exists');
        err.statusCode = 409;
        throw err;
    }

    // Always create with empty permissions — use assignPermissions to set them
    return await Role.create({
        name: name.trim(),
        description: description?.trim() || '',
        color: color?.trim() || '#722ed1',
        permissions: [],
    });
};

const getAllRoles = async () => {
    const roles = await Role.find().sort({ name: 1 });

    // Attach a live count of assigned users so the UI can disable Delete
    // without a second round trip.
    const counts = await User.aggregate([
        { $match: { role: { $in: roles.map((r) => r.name) } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const countMap = counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {});

    return roles.map((role) => ({
        ...role.toObject(),
        userCount: countMap[role.name] || 0,
    }));
};

const getRoleById = async (id) => {
    return await Role.findById(id);
};

const updateRole = async (id, { name, description, color }) => {
    const role = await Role.findById(id);
    if (!role) return null;

    if (role.isSystem && name !== undefined && name.trim() !== role.name) {
        const err = new Error('System roles cannot be renamed');
        err.statusCode = 403;
        throw err;
    }

    if (name !== undefined && name !== null) role.name = name.trim();
    if (description !== undefined) role.description = description.trim();
    if (color !== undefined) role.color = color.trim();

    // permissions are NEVER updated here — use assignPermissions instead
    await role.save();
    return role;
};

const deleteRole = async (id) => {
    const role = await Role.findById(id);
    if (!role) return null;

    if (role.isSystem) {
        const err = new Error('System roles cannot be deleted');
        err.statusCode = 403;
        throw err;
    }

    const assignedCount = await User.countDocuments({ role: role.name });
    if (assignedCount > 0) {
        const err = new Error(
            `Cannot delete role: ${assignedCount} user(s) are currently assigned to it`
        );
        err.statusCode = 409;
        throw err;
    }

    await Role.findByIdAndDelete(id);
    return role;
};

/**
 * Assign (replace) the full permissions array for a role.
 * @param {string} roleId
 * @param {Array<{ resource: string, action: { view, create, update, delete } }>} permissionsPayload
 */
const assignPermissions = async (roleId, permissionsPayload) => {
    const role = await Role.findById(roleId);
    if (!role) {
        const err = new Error('Role not found');
        err.statusCode = 404;
        throw err;
    }

    role.permissions = normalizePermissions(permissionsPayload);
    await role.save();

    return role;
};

// Used at registration time to assign a starting role to new signups.
const getDefaultRole = async () => {
    return await Role.findOne({ isDefault: true });
};

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    assignPermissions,
    getDefaultRole,
    normalizePermissions,
};