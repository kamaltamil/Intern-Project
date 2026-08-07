const Role = require('../models/role');
const RolePermissions = require('../models/rolePermissions');

const createRole = async ({ name, description, color }) => {

    const existing = await Role.findOne({ name: name.trim() });

    if (existing) {
        const err = new Error("Role already exists");
        err.statusCode = 409;
        throw err;
    }

    // Always create with empty permissions — use assignPermissions to set them
    return await Role.create({
        name: name.trim(),
        description: description?.trim() || "",
        color: color?.trim() || "#722ed1",
        permissions: [],
    });

};

const getAllRoles = async () => {

    return await Role.find()
        .populate("permissions")
        .sort({ name: 1 });

};

const getRoleById = async (id) => {

    return await Role.findById(id)
        .populate("permissions");

};

const updateRole = async (id, { name, description, color }) => {

    const update = {};

    if (name !== undefined && name !== null)
        update.name = name.trim();

    if (description !== undefined)
        update.description = description.trim();

    if (color !== undefined)
        update.color = color.trim();

    // permissions are NEVER updated here — use assignPermissions instead
    return await Role.findByIdAndUpdate(
        id,
        update,
        { new: true, runValidators: true }
    ).populate("permissions");

};

const deleteRole = async (id) => {
    // Also clean up associated RolePermissions docs
    const role = await Role.findById(id).populate("permissions");
    if (role && role.permissions && role.permissions.length > 0) {
        const permIds = role.permissions.map((p) => p._id);
        await RolePermissions.deleteMany({ _id: { $in: permIds } });
    }
    return await Role.findByIdAndDelete(id);
};

/**
 * Assign (replace) the full permissions array for a role.
 * @param {string} roleId
 * @param {Array<{ resource: string, action: { view, create, update, delete } }>} permissionsPayload
 */
const assignPermissions = async (roleId, permissionsPayload) => {
    const role = await Role.findById(roleId);
    if (!role) {
        const err = new Error("Role not found");
        err.statusCode = 404;
        throw err;
    }

    // Delete existing permission docs for this role
    if (role.permissions && role.permissions.length > 0) {
        await RolePermissions.deleteMany({ _id: { $in: role.permissions } });
    }

    // Create fresh permission docs for each module
    const permDocs = await RolePermissions.insertMany(
        permissionsPayload.map(({ resource, action }) => ({
            resource: resource.trim(),
            action: {
                view: action?.view || false,
                create: action?.create || false,
                update: action?.update || false,
                delete: action?.delete || false,
            },
        }))
    );

    role.permissions = permDocs.map((p) => p._id);
    await role.save();

    return await Role.findById(roleId).populate("permissions");
};

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    assignPermissions,
};
