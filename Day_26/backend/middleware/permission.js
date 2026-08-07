const { getPermissionsForRole } = require('../services/permissionService');

/**
 * requirePermission('bookings', 'create')
 *
 * Looks up the caller's role permissions (as configured by an Admin in
 * Role Management) and only lets the request through if that role has
 * `action` granted on `resource`.
 *
 * Also attaches the full permission map to req.permissions so controllers
 * can make further scope decisions (e.g. "view own" vs "view all")
 * without querying the DB again.
 */
const requirePermission = (resource, action) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const permissions = await getPermissionsForRole(req.user.role);
            req.permissions = permissions;

            if (!permissions[resource]?.[action]) {
                return res.status(403).json({
                    message: `Forbidden: your role does not have '${action}' access on '${resource}'`,
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ message: 'Error checking permissions', error: error.message });
        }
    };
};

module.exports = { requirePermission };