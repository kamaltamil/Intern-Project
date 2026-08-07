const express = require('express');
const router = express.Router();

const {
    createRoleHandler,
    listRoles,
    updateRoleHandler,
    deleteRoleHandler,
    assignPermissionsHandler,
    getRoleMeta,
} = require('../../../controllers/roleController');

const { requirePermission } = require('../../../middleware/permission');
const { validatePermissionsPayload } = require('../../../validators/roleValidator');

// authenticateToken is already applied at the mount point in api.js
// GET /roles is allowed for any authenticated user so they can fetch their own permissions
router.get('/', listRoles);
// Static config for the Role Management UI (module labels, actions, colors) — no DB lookup needed
router.get('/meta', getRoleMeta);
router.post('/', requirePermission('roles', 'create'), validatePermissionsPayload, createRoleHandler);
router.patch('/:id', requirePermission('roles', 'update'), updateRoleHandler);
router.delete('/:id', requirePermission('roles', 'delete'), deleteRoleHandler);
router.patch('/:id/permissions', requirePermission('roles', 'update'), validatePermissionsPayload, assignPermissionsHandler);

module.exports = router;