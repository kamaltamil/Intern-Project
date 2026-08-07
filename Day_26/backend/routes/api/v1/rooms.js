const express = require('express');
const router = express.Router();

const {
    createRoom,
    getAllRooms
} = require('../../../controllers/roomsController');

const { authenticateToken } = require('../../../middleware/auth');
const { requirePermission } = require('../../../middleware/permission');

// Anyone signed in can browse rooms (needed to make a booking)
router.get('/', authenticateToken, getAllRooms);
// Adding new room inventory is a permissioned action
router.post('/new', authenticateToken, requirePermission('rooms', 'create'), createRoom);

module.exports = router;