const express = require('express');
const router = express.Router();

const {
    createRoom,
    getAllRooms
} = require('../../../controllers/roomsController');

const { authenticateToken, requireRole } = require('../../../middleware/auth');

router.get('/', authenticateToken, getAllRooms);
router.post('/new', authenticateToken, requireRole('admin'), createRoom);

module.exports = router;