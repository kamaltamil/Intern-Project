const express = require('express');
const router = express.Router();

const {
    createRoleHandler,
    listRoles,
    updateRoleHandler,
    deleteRoleHandler,
    assignPermissionsHandler,
} = require('../../../controllers/roleController');

const { authenticateToken, requireRole } = require('../../../middleware/auth');

// GET /roles is allowed for any authenticated user so they can fetch their own permissions
router.get('/', authenticateToken, listRoles);
router.post('/', authenticateToken, requireRole('Admin'), createRoleHandler);
router.patch('/:id', authenticateToken, requireRole('Admin'), updateRoleHandler);
router.delete('/:id', authenticateToken, requireRole('Admin'), deleteRoleHandler);
router.patch('/:id/permissions', authenticateToken, requireRole('Admin'), assignPermissionsHandler);

module.exports = router;
