const {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    assignPermissions,
} = require('../services/roleService');

const createRoleHandler = async (req, res) => {
    try {
        const { name, description, color, permissions } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Role name is required" });
        }

        // Step 1: Create the role with empty permissions
        const role = await createRole({ name, description, color });

        // Step 2: If permissions payload provided, assign them and return the populated role
        if (Array.isArray(permissions) && permissions.length > 0 && permissions[0]?.resource) {
            const populatedRole = await assignPermissions(role._id, permissions);
            return res.status(201).json({ message: "Role created successfully", role: populatedRole });
        }

        return res.status(201).json({ message: "Role created successfully", role });

    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const listRoles = async (req, res) => {
    try {
        const roles = await getAllRoles();
        return res.json(roles);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateRoleHandler = async (req, res) => {
    try {
        // Allow name, description and color to be updated here
        const { name, description, color } = req.body;

        const role = await updateRole(req.params.id, { name, description, color });

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        return res.json({ message: "Role updated successfully", role });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteRoleHandler = async (req, res) => {
    try {
        const role = await deleteRole(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        return res.status(200).json({ message: 'Role deleted successfully', role });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting role', error: error.message });
    }
};

/**
 * PATCH /roles/:id/permissions
 * Body: { permissions: [{ resource: string, action: { view, create, update, delete } }] }
 */
const assignPermissionsHandler = async (req, res) => {
    try {
        const { permissions } = req.body;

        if (!Array.isArray(permissions)) {
            return res.status(400).json({ message: 'permissions must be an array' });
        }

        const role = await assignPermissions(req.params.id, permissions);

        return res.json({
            message: 'Permissions assigned successfully',
            role,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createRoleHandler,
    listRoles,
    updateRoleHandler,
    deleteRoleHandler,
    assignPermissionsHandler,
};
