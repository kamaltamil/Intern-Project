const mongoose = require('mongoose');

const rolePermissionsSchema = mongoose.Schema(
    {
        resource: {
            type: String,
            required: [true, 'Resource name is required'],
            trim: true,
        },
        action: {
            view:   { type: Boolean, default: false },
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('RolePermissions', rolePermissionsSchema);