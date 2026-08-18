const mongoose = require('mongoose');
const MODULES = require('../constants/modules');

// Defines the CRUD actions available for each RBAC resource.
const actionSchema = new mongoose.Schema(
    {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
    },
    { _id: false }
);

// Associates a module with its allowed actions in a role's permission set.
const permissionSchema = new mongoose.Schema(
    {
        resource: {
            type: String,
            required: [true, 'Resource name is required'],
            enum: Object.values(MODULES),
            trim: true,
        },
        action: {
            type: actionSchema,
            default: () => ({ view: false, create: false, update: false, delete: false }),
        },
    },
    { _id: false }
);

// Stores role metadata, permissions, and the roles this role can manage.
const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Role name is required'],
            unique: true,
            trim: true,
            minlength: [2, 'Role name must be at least 2 characters'],
            maxlength: [50, 'Role name must be at most 50 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Description must be at most 200 characters'],
            default: '',
        },
        color: {
            type: String,
            default: '#722ed1',
            trim: true,
        },
        isSystem: {
            type: Boolean,
            default: false,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        permissions: {
            type: [permissionSchema],
            default: [],
        },
        manageableRoles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Role',
            },
        ],
        dashboardConfig: {
            stats: [
                {
                    key: { type: String, trim: true },
                    title: { type: String, trim: true },
                    icon: { type: String, trim: true },
                    color: { type: String, trim: true },
                },
            ],
            banner: {
                enabled: { type: Boolean, default: true },
                title: { type: String, default: '' },
                subtitle: { type: String, default: '' },
                actionLabel: { type: String, default: '' },
                actionUrl: { type: String, default: '' },
                image: { type: String, default: '' },
            },
        },
    },
    { timestamps: true }
);

// Prevent the database from storing more than one default role.
roleSchema.index(
    { isDefault: 1 },
    {
        unique: true,
        partialFilterExpression: { isDefault: true },
    }
);

module.exports = mongoose.model('Role', roleSchema);