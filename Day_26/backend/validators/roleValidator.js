const MODULE_LIST = require('../constants/modules');

const VALID_MODULES = Object.values(MODULE_LIST);
const VALID_ACTIONS = ['view', 'create', 'update', 'delete'];

/**
 * Validates the `permissions` array on role create / assign-permissions
 * requests. Rejects the request (400) if it's malformed or breaks the
 * "view must be on if create/update/delete is on" rule, instead of
 * silently fixing it — the client should never send a payload the
 * Role Management UI itself wouldn't produce.
 */
const validatePermissionsPayload = (req, res, next) => {
    const { permissions } = req.body;

    // permissions is optional on create — nothing to validate if absent
    if (permissions === undefined) return next();

    if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: 'permissions must be an array' });
    }

    for (const entry of permissions) {
        if (!entry || typeof entry !== 'object') {
            return res.status(400).json({ message: 'Each permission entry must be an object' });
        }

        if (!VALID_MODULES.includes(entry.resource)) {
            return res.status(400).json({ message: `Invalid module: ${entry.resource}` });
        }

        const action = entry.action || {};
        for (const key of Object.keys(action)) {
            if (!VALID_ACTIONS.includes(key)) {
                return res.status(400).json({ message: `Invalid permission action: ${key}` });
            }
            if (typeof action[key] !== 'boolean') {
                return res.status(400).json({ message: `Permission action "${key}" must be true or false` });
            }
        }

        const wantsAction = action.create || action.update || action.delete;
        if (wantsAction && !action.view) {
            return res.status(400).json({
                message: `"${entry.resource}": view must be enabled if create, update, or delete is enabled`,
            });
        }
    }

    next();
};

module.exports = { validatePermissionsPayload };