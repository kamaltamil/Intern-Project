const mongoose = require('mongoose');

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
        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'RolePermissions',
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
