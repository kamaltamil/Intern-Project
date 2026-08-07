const mongoose = require('mongoose');
const MODULES = require('../constants/modules');

const permissionSchema = new mongoose.Schema(
    {
        resource: {
            type: String,
            required: [true, 'Resource name is required'],
            enum: Object.values(MODULES),
            trim: true,
        },
        actions: {
            view: { type: Boolean, default: false },
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
        }
    },
    { _id: false }
);

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
        // Seeded roles (Admin/Manager/Member) — protected from rename/delete
        isSystem: {
            type: Boolean,
            default: false,
        },
        // Auto-assigned to new signups (exactly one role should have this true)
        isDefault: {
            type: Boolean,
            default: false,
        },
        // Embedded directly on the role — no more separate RolePermissions
        // collection or populate() needed to read/write permissions.
        permissions: {
            type: [permissionSchema],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);