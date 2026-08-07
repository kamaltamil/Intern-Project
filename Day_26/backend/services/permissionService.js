const Role = require('../models/role');

/**
 * Returns the permission map for a role, e.g:
 * { bookings: { view: true, create: true, update: false, delete: false }, ... }
 * Returns {} if the role doesn't exist or has no permissions assigned.
 */
const getPermissionsForRole = async (roleName) => {
    if (!roleName) return {};

    const role = await Role.findOne({ name: roleName }).lean();
    if (!role) return {};

    const map = {};
    for (const perm of role.permissions || []) {
        map[perm.resource] = perm.action;
    }
    return map;
};

/**
 * Checks whether a role is allowed to perform `action` on `resource`.
 */
const hasPermission = async (roleName, resource, action) => {
    const permissions = await getPermissionsForRole(roleName);
    return Boolean(permissions[resource]?.[action]);
};

module.exports = {
    getPermissionsForRole,
    hasPermission,
};