const express = require('express');
const router = express.Router();

const {
    createRoleHandler,
    listRoles,
    updateRoleHandler,
    deleteRoleHandler,
    assignPermissionsHandler,
} = require('../../../controllers/roleController');

const { authenticateToken } = require('../../../middleware/auth');
const { requirePermission } = require('../../../middleware/permission');

// GET /roles is allowed for any authenticated user so they can fetch their own permissions
router.get('/', authenticateToken, listRoles);
router.post('/', authenticateToken, requirePermission('roles', 'create'), createRoleHandler);
router.patch('/:id', authenticateToken, requirePermission('roles', 'update'), updateRoleHandler);
router.delete('/:id', authenticateToken, requirePermission('roles', 'delete'), deleteRoleHandler);
router.patch('/:id/permissions', authenticateToken, requirePermission('roles', 'update'), assignPermissionsHandler);

module.exports = router;