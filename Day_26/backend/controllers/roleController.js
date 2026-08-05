const {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
} = require('../services/roleService');

const createRoleHandler = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Role name is required' });
        }

        const role = await createRole({ name, description });
        return res.status(201).json({ message: 'Role created successfully', role });
    } catch (error) {
        const status = error.statusCode === 409 ? 409 : 500;
        return res.status(status).json({
            message: status === 409 ? 'Role already exists' : 'Error creating role',
            error: error.message,
        });
    }
};

const listRoles = async (req, res) => {
    try {
        const roles = await getAllRoles();
        return res.status(200).json(roles);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching roles', error: error.message });
    }
};

const updateRoleHandler = async (req, res) => {
    try {
        const role = await updateRole(req.params.id, req.body);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        return res.status(200).json({ message: 'Role updated successfully', role });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating role', error: error.message });
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

module.exports = {
    createRoleHandler,
    listRoles,
    updateRoleHandler,
    deleteRoleHandler,
};
