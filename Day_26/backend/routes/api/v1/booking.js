const express = require('express');
const router = express.Router();

const {
    bookRoom,
    getBookings
} = require('../../../controllers/bookingController')

const {
    authenticateToken
} = require('../../../middleware/auth')

const { requirePermission } = require('../../../middleware/permission')

router.get('/', authenticateToken, requirePermission('bookings', 'view'), getBookings)
router.post('/new', authenticateToken, requirePermission('bookings', 'create'), bookRoom)

module.exports = router;