const Role = require('../models/role');

const createRole = async ({ name, description }) => {
    const existing = await Role.findOne({ name: name.trim() });
    if (existing) {
        const error = new Error('Role already exists');
        error.statusCode = 409;
        throw error;
    }
    return await Role.create({ name: name.trim(), description: description?.trim() || '' });
};

const getAllRoles = async () => {
    return await Role.find().sort({ name: 1 });
};

const getRoleById = async (id) => {
    return await Role.findById(id);
};

const updateRole = async (id, { name, description }) => {
    const update = {};
    if (name) update.name = name.trim();
    if (description !== undefined) update.description = description.trim();

    return await Role.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
    });
};

const deleteRole = async (id) => {
    return await Role.findByIdAndDelete(id);
};

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
};
