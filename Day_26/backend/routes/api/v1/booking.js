const express = require('express');
const router = express.Router();

const {
    bookRoom,
    getBookings
} = require('../../../controllers/bookingController')

const { requirePermission } = require('../../../middleware/permission')

// authenticateToken is already applied at the mount point in api.js
router.get('/', requirePermission('bookings', 'view'), getBookings)
router.post('/new', requirePermission('bookings', 'create'), bookRoom)

module.exports = router;