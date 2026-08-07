const express = require('express');
const router = express.Router();

const {
    createRoleHandler,
    listRoles,
    updateRoleHandler,
    deleteRoleHandler,
    assignPermissionsHandler,
} = require('../../../controllers/roleController');


const { requirePermission } = require('../../../middleware/permission');

// GET /roles is allowed for any authenticated user so they can fetch their own permissions
router.get('/', listRoles);
router.post('/', requirePermission('roles', 'create'), createRoleHandler);
router.patch('/:id', requirePermission('roles', 'update'), updateRoleHandler);
router.delete('/:id', requirePermission('roles', 'delete'), deleteRoleHandler);
router.patch('/:id/permissions', requirePermission('roles', 'update'), assignPermissionsHandler);

module.exports = router;