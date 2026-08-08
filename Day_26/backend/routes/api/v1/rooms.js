const express = require('express');
const router = express.Router();

const {
    createRoom,
    getAllRooms
} = require('../../../controllers/roomsController');

const { requirePermission } = require('../../../middleware/permissionMiddleware');

// authenticateToken is already applied at the mount point in api.js
// Anyone signed in can browse rooms (needed to make a booking)
router.get('/', getAllRooms);
// Adding new room inventory is a permissioned action
router.post('/new', requirePermission('rooms', 'create'), createRoom);

module.exports = router;