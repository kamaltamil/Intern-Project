const express = require('express');
const router = express.Router();

const {
    createRoleHandler,
    listRoles,
    updateRoleHandler,
    deleteRoleHandler,
} = require('../../../controllers/roleController');

const { authenticateToken, requireRole } = require('../../../middleware/auth');

// All role routes require Admin
router.get('/', authenticateToken, requireRole('Admin'), listRoles);
router.post('/', authenticateToken, requireRole('Admin'), createRoleHandler);
router.patch('/:id', authenticateToken, requireRole('Admin'), updateRoleHandler);
router.delete('/:id', authenticateToken, requireRole('Admin'), deleteRoleHandler);

module.exports = router;
